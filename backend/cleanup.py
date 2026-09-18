from typing import List, Dict, Any, Tuple
import datetime
from normalizer import normalize_customer
from duplicate_detector import find_candidates
from ai_agent import investigate_candidate, parse_user_prompt_intent


def deterministic_eval(candidate: Dict[str, Any], intent: Dict[str, Any]) -> Tuple[str, str]:
    """
    Evaluates candidates deterministically to avoid unnecessary LLM calls.
    Returns (action, reason) where action can be:
    - 'MERGE' (unambiguous duplicate)
    - 'PRESERVE' (unambiguous distinct entities)
    - 'AI_INVESTIGATE' (ambiguous case needing AI evaluation)
    """
    scores = candidate["field_scores"]
    overall_score = candidate["overall_score"]
    conflicts = candidate.get("conflicts", [])

    # If there are any conflicts, always send to AI for investigation
    if conflicts:
        return "AI_INVESTIGATE", f"Potential duplicate has {len(conflicts)} conflict(s) requiring investigation."

    # If prompt specifies strict name rules or conservatism, borderline cases go to AI
    if intent.get("conservative") or intent.get("flag_uncertain") or intent.get("do_not_merge_names_only"):
        # Very high bar for deterministic merge without AI
        if (
            scores["email"] >= 0.99
            and scores["phone"] >= 0.99
            and scores["name"] >= 0.99
            and scores["address"] >= 0.95
        ):
            return "MERGE", "Exact match across all primary identifiers (name, email, phone, address)."

        # Borderline or non-identical pairs need AI investigation
        if overall_score >= 0.40:
            return "AI_INVESTIGATE", "Ambiguous candidate requires AI investigation."

        return "PRESERVE", "Evidence is insufficient for duplication."

    # Standard / default pipeline
    if (
        overall_score >= 0.90
        and scores["email"] >= 0.95
        and scores["phone"] >= 0.95
    ):
        return "MERGE", "Strong agreement on email, phone, and core profile."

    if overall_score < 0.40:
        return "PRESERVE", "Evidence is insufficient for duplication."

    return "AI_INVESTIGATE", "Candidate pair falls within the ambiguous threshold."


def choose_best_value(vals: List[str]) -> str:
    """Selects the most complete/detailed non-empty string."""
    valid = [v for v in vals if v and v.strip()]
    if not valid:
        return ""
    # Sort by length descending, prefer non-abbreviated
    return max(valid, key=lambda s: len(s.strip()))


def create_master_dataset(
    customers: List[Dict[str, Any]],
    decisions: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Builds the clean master dataset from individual customer records
    and candidate decisions using connected component clustering for merged entities.
    """
    # Build graph of merged records
    parent = {c["customer_id"]: c["customer_id"] for c in customers}

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        rx, ry = find(x), find(y)
        if rx != ry:
            parent[rx] = ry

    # Merge records that were decided as MERGE
    for d in decisions:
        if d["action"] == "MERGE":
            id1 = d["customer_id_1"]
            id2 = d["customer_id_2"]
            if id1 in parent and id2 in parent:
                union(id1, id2)

    # Group records by cluster root
    clusters: Dict[str, List[Dict[str, Any]]] = {}
    for c in customers:
        cid = c["customer_id"]
        root = find(cid)
        if root not in clusters:
            clusters[root] = []
        clusters[root].append(c)

    # Also keep track of records flagged for review
    review_ids = set()
    for d in decisions:
        if d["action"] == "REVIEW":
            review_ids.add(d["customer_id_1"])
            review_ids.add(d["customer_id_2"])

    master_dataset = []

    for root, members in clusters.items():
        if len(members) > 1:
            # Merged entity: create canonical golden master record
            names = [m.get("name", "") for m in members]
            emails = [m.get("email", "") for m in members]
            phones = [m.get("phone", "") for m in members]
            addresses = [m.get("address", "") for m in members]
            cities = [m.get("city", "") for m in members]
            timestamps = [m.get("last_updated", "") for m in members]
            sources = list(set([m.get("source", "") for m in members if m.get("source")]))
            member_ids = [m["customer_id"] for m in members]

            # Canonical attributes selection
            canonical_name = choose_best_value(names)
            canonical_email = choose_best_value(emails)
            canonical_phone = choose_best_value(phones)
            canonical_address = choose_best_value(addresses)
            canonical_city = choose_best_value(cities)
            latest_timestamp = max([t for t in timestamps if t] or [""])

            master_dataset.append({
                "master_id": f"M-{root}",
                "name": canonical_name,
                "email": canonical_email,
                "phone": canonical_phone,
                "address": canonical_address,
                "city": canonical_city,
                "last_updated": latest_timestamp,
                "merged_customer_ids": sorted(member_ids),
                "sources": sorted(sources),
                "record_status": "merged"
            })
        else:
            # Single entity
            m = members[0]
            cid = m["customer_id"]
            status = "flagged_for_review" if cid in review_ids else "preserved"

            master_dataset.append({
                "master_id": cid,
                "name": m.get("name", ""),
                "email": m.get("email", ""),
                "phone": m.get("phone", ""),
                "address": m.get("address", ""),
                "city": m.get("city", ""),
                "last_updated": m.get("last_updated", ""),
                "merged_customer_ids": [cid],
                "sources": [m.get("source", "")] if m.get("source") else [],
                "record_status": status
            })

    # Sort master dataset by master_id
    master_dataset.sort(key=lambda x: x["master_id"])
    return master_dataset


def generate_agent_response(
    user_request: str,
    total_records: int,
    decisions: List[Dict[str, Any]],
    master_dataset: List[Dict[str, Any]]
) -> str:
    """
    Generates a natural-language final response understandable to the user,
    summarizing findings, evidence, actions taken, and safety measures.
    """
    merge_count = sum(1 for d in decisions if d["action"] == "MERGE")
    review_count = sum(1 for d in decisions if d["action"] == "REVIEW")
    preserve_count = sum(1 for d in decisions if d["action"] == "PRESERVE")

    lines = []
    lines.append(f"### Data Quality Agent Summary")
    lines.append(f"**Request**: \"{user_request}\"")
    lines.append(
        f"Evaluated **{total_records} customer records**, generating **{len(decisions)} candidate pairs**."
    )
    lines.append("")
    lines.append("#### Key Decisions & Actions:")
    if merge_count > 0:
        lines.append(f"- **Merged Pairs ({merge_count})**:")
        for d in decisions:
            if d["action"] == "MERGE":
                lines.append(
                    f"  - **{d['customer_id_1']} & {d['customer_id_2']}**: {d['reason']} (Confidence: {int(d['confidence']*100)}%)"
                )
    else:
        lines.append("- **Merged Pairs**: 0 (No candidates met confidence threshold for safe merging)")

    if review_count > 0:
        lines.append(f"- **Flagged for Review ({review_count})**:")
        for d in decisions:
            if d["action"] == "REVIEW":
                lines.append(
                    f"  - **{d['customer_id_1']} & {d['customer_id_2']}**: {d['reason']} (Confidence: {int(d['confidence']*100)}%)"
                )

    if preserve_count > 0:
        lines.append(f"- **Preserved Separately ({preserve_count})**:")
        for d in decisions:
            if d["action"] == "PRESERVE":
                lines.append(
                    f"  - **{d['customer_id_1']} & {d['customer_id_2']}**: {d['reason']}"
                )

    lines.append("")
    lines.append(
        f"#### Master Dataset Result:"
    )
    lines.append(
        f"- Generated **{len(master_dataset)} golden master records** (merged duplicates consolidated with full provenance)."
    )
    lines.append(
        f"- Safety check: Conflicting records were safely isolated and prevented from merging."
    )

    return "\n".join(lines)


def cleanup_customers(customers: List[Dict[str, Any]], user_request: str) -> Dict[str, Any]:
    """
    Main autonomous cleanup pipeline:
    1. Deterministic normalization
    2. Candidate duplicate pair generation
    3. Deterministic filtering + AI investigation for ambiguous cases
    4. Conflict prevention & safety checks
    5. Clean master dataset generation
    6. Executive summary response
    """
    intent = parse_user_prompt_intent(user_request)

    # Step 1: Normalize all customer records
    normalized = [normalize_customer(c) for c in customers]

    # Step 2: Find candidate pairs
    candidates = find_candidates(normalized)

    decisions = []

    # Step 3: Process every candidate pair
    for candidate in candidates:
        det_action, det_reason = deterministic_eval(candidate, intent)

        if det_action == "AI_INVESTIGATE":
            # Ambiguous candidate pair investigated by AI
            ai_result = investigate_candidate(candidate, user_request)
            action = ai_result["decision"]
            reason = ai_result["reason"]
            evidence = ai_result.get("evidence", [])
            confidence = ai_result.get("confidence", candidate["overall_score"])
        else:
            action = det_action
            reason = det_reason
            evidence = []
            confidence = candidate["overall_score"]

        # Step 4: Final safety check - Prevent unsafe merges on conflicting evidence
        conflicts = candidate.get("conflicts", [])
        if action == "MERGE" and conflicts:
            action = "REVIEW"
            reason = f"Unsafe merge prevented due to conflicting evidence: {'; '.join(conflicts)}"
            evidence.append("Automatic merge overridden by safety policy.")

        # Clean representations of customer records for response
        c1_clean = {k: v for k, v in candidate["customer1"].items() if not k.endswith("_normalized") and k != "name_info"}
        c2_clean = {k: v for k, v in candidate["customer2"].items() if not k.endswith("_normalized") and k != "name_info"}

        decisions.append({
            "customer_id_1": candidate["customer1"]["customer_id"],
            "customer_id_2": candidate["customer2"]["customer_id"],
            "customer_1": c1_clean,
            "customer_2": c2_clean,
            "score": round(candidate["overall_score"], 3),
            "action": action,
            "confidence": round(float(confidence), 2),
            "reason": reason,
            "evidence": evidence,
            "conflicts": conflicts,
            "field_scores": candidate["field_scores"]
        })

    # Step 5: Build clean master dataset
    master_dataset = create_master_dataset(customers, decisions)

    # Step 6: Generate executive summary
    agent_response = generate_agent_response(
        user_request,
        len(customers),
        decisions,
        master_dataset
    )

    merged_count = sum(1 for d in decisions if d["action"] == "MERGE")
    preserved_count = sum(1 for d in decisions if d["action"] == "PRESERVE")
    review_count = sum(1 for d in decisions if d["action"] == "REVIEW")

    return {
        "total_records": len(customers),
        "user_request": user_request,
        "summary": {
            "total_records": len(customers),
            "candidates_evaluated": len(decisions),
            "merged_pairs": merged_count,
            "preserved_pairs": preserved_count,
            "review_pairs": review_count,
            "master_records_count": len(master_dataset)
        },
        "agent_response": agent_response,
        "decisions": decisions,
        "master_dataset": master_dataset
    }