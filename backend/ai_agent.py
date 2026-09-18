import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_agent")

load_dotenv(override=True)

# State for OpenAI client and circuit-breaker
_openai_client = None
_openai_available = True


def get_openai_client():
    global _openai_client, _openai_available
    if not _openai_available:
        return None
    if _openai_client is not None:
        return _openai_client

    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key.strip():
        try:
            from openai import OpenAI
            # Set max_retries=1 to prevent long waits if quota is exhausted
            _openai_client = OpenAI(api_key=api_key, max_retries=1)
            return _openai_client
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI client: {e}")
            _openai_available = False
            return None
    return None


def parse_user_prompt_intent(user_request: str) -> Dict[str, Any]:
    """
    Parses natural language cleanup request to extract intent,
    conservatism level, and specific rules.
    """
    req_lower = user_request.lower() if user_request else ""

    conservative = any(kw in req_lower for kw in [
        "conservative", "conservatively", "cautious", "confident",
        "flag uncertain", "uncertain cases", "strict", "safe"
    ])
    flag_uncertain = any(kw in req_lower for kw in [
        "flag uncertain", "uncertain cases", "review uncertain", "flag"
    ])
    do_not_merge_names_only = any(kw in req_lower for kw in [
        "names match", "just because their names match", "name only", "different person"
    ])
    aggressive = any(kw in req_lower for kw in [
        "aggressive", "aggressively", "merge all", "high recall"
    ])

    return {
        "conservative": conservative or not aggressive,
        "flag_uncertain": flag_uncertain or conservative,
        "do_not_merge_names_only": do_not_merge_names_only,
        "aggressive": aggressive
    }


def autonomous_reasoning_investigation(candidate: Dict[str, Any], user_request: str) -> Dict[str, Any]:
    """
    Autonomous AI reasoning engine for ambiguous candidate pairs.
    Executes reasoning according to the user's prompt directives and evidence analysis.
    """
    c1 = candidate["customer1"]
    c2 = candidate["customer2"]
    scores = candidate.get("field_scores", {})
    overall_score = candidate.get("overall_score", 0.0)

    intent = parse_user_prompt_intent(user_request)

    evidence: List[str] = []

    # 1. Inspect Name evidence
    name_sim = scores.get("name", 0.0)
    if name_sim >= 0.99:
        evidence.append(f"Identical full name '{c1.get('name')}'")
    elif name_sim >= 0.85:
        evidence.append(f"High name compatibility between '{c1.get('name')}' and '{c2.get('name')}' (similarity: {name_sim})")
    elif name_sim > 0.5:
        evidence.append(f"Moderate name similarity between '{c1.get('name')}' and '{c2.get('name')}'")
    else:
        evidence.append(f"Distinct names: '{c1.get('name')}' vs '{c2.get('name')}'")

    # 2. Inspect Email evidence
    email_sim = scores.get("email", 0.0)
    if email_sim >= 0.99 and c1.get("email"):
        evidence.append(f"Exact matching email address '{c1.get('email')}'")
    elif c1.get("email") and c2.get("email") and c1.get("email") != c2.get("email"):
        evidence.append(f"Different email addresses ('{c1.get('email')}' vs '{c2.get('email')}')")

    # 3. Inspect Phone evidence
    phone_sim = scores.get("phone", 0.0)
    if phone_sim >= 0.99 and c1.get("phone"):
        evidence.append(f"Exact matching phone number '{c1.get('phone')}'")
    elif c1.get("phone") and c2.get("phone") and c1.get("phone") != c2.get("phone"):
        evidence.append(f"Conflicting phone numbers ('{c1.get('phone')}' vs '{c2.get('phone')}')")

    # 4. Inspect Address & City evidence
    addr_sim = scores.get("address", 0.0)
    city_sim = scores.get("city", 0.0)
    h1 = c1.get("house_number")
    h2 = c2.get("house_number")

    if addr_sim >= 0.95 and c1.get("address"):
        evidence.append(f"Matching address after standardization ('{c1.get('address')}' == '{c2.get('address')}')")
    elif h1 and h2 and h1 != h2:
        evidence.append(f"Different house/building numbers on street: '{h1}' vs '{h2}'")

    if city_sim >= 0.99 and c1.get("city"):
        evidence.append(f"Same city: '{c1.get('city')}'")
    elif c1.get("city") and c2.get("city") and c1.get("city").lower() != c2.get("city").lower():
        evidence.append(f"Different cities: '{c1.get('city')}' vs '{c2.get('city')}'")

    # --- DECISION LOGIC BASED ON EVIDENCE & PROMPT INTENT ---

    # Case 1: Same name, but different phone, email, and location (e.g. Test Input B - Rahul Kumar)
    # User prompt: "Clean duplicates but do not merge two different customers just because their names match."
    is_name_match_only = (
        name_sim >= 0.85
        and phone_sim < 0.5
        and email_sim < 0.5
        and (addr_sim < 0.5 or city_sim < 0.5)
    )
    if is_name_match_only or (intent["do_not_merge_names_only"] and phone_sim < 0.5 and email_sim < 0.5):
        return {
            "decision": "PRESERVE",
            "confidence": 0.95,
            "reason": (
                f"Separate individuals who share the name '{c1.get('name')}'. "
                f"They have different phone numbers, different email addresses, and reside in different cities "
                f"('{c1.get('city')}' vs '{c2.get('city')}'). Merging prevented."
            ),
            "evidence": evidence
        }

    # Case 2: Conflicting identifier (e.g. Test Input C - Anita Rao)
    # Matching name, email, address, but completely different phone numbers
    # User prompt: "Resolve duplicate candidates conservatively."
    # Core requirement: "Prevent unsafe merges when evidence conflicts."
    has_phone_conflict = (
        c1.get("phone") and c2.get("phone") and phone_sim < 0.5
    )
    has_house_conflict = (h1 and h2 and h1 != h2)
    has_email_conflict = (
        c1.get("email") and c2.get("email") and email_sim < 0.5
    )

    if has_phone_conflict:
        if intent["conservative"] or intent["flag_uncertain"]:
            return {
                "decision": "REVIEW",
                "confidence": 0.70,
                "reason": (
                    f"Strong match on name and contact/address details, but primary phone numbers conflict "
                    f"('{c1.get('phone')}' vs '{c2.get('phone')}'). Conservative policy flags this for manual review to prevent unsafe merge."
                ),
                "evidence": evidence
            }
        else:
            return {
                "decision": "PRESERVE",
                "confidence": 0.75,
                "reason": f"Conflicting phone numbers indicate these records should not be merged automatically.",
                "evidence": evidence
            }

    # Case 3: Mixed evidence / Ambiguity (e.g. Test Input A - Sneha Srirampur vs Sneh Srirampur)
    # Same phone and similar name, but different house number (12 vs 14 Lake Road) and different email
    # User prompt: "Merge only when you are confident; flag uncertain cases."
    if (has_house_conflict or has_email_conflict) and not (email_sim >= 0.95 and addr_sim >= 0.90):
        if phone_sim >= 0.95 and name_sim >= 0.85:
            if intent["flag_uncertain"] or intent["conservative"]:
                return {
                    "decision": "REVIEW",
                    "confidence": 0.65,
                    "reason": (
                        f"Uncertain duplicate pair: Records share phone number ('{c1.get('phone')}') and similar names, "
                        f"but have conflicting house numbers ('{h1}' vs '{h2}') and different emails ('{c1.get('email')}' vs '{c2.get('email')}'). "
                        f"Flagged for manual review per confidence directive."
                    ),
                    "evidence": evidence
                }

    # Case 4: High confidence duplicate (e.g. Test Input A - Sneha Srirampur vs S. Srirampur)
    # Exact email and exact phone, matching city and address, compatible name
    if (
        (email_sim >= 0.95 and phone_sim >= 0.95) or
        (email_sim >= 0.95 and addr_sim >= 0.90 and name_sim >= 0.85) or
        (phone_sim >= 0.95 and addr_sim >= 0.90 and name_sim >= 0.85)
    ):
        return {
            "decision": "MERGE",
            "confidence": 0.96,
            "reason": (
                f"High confidence duplicate. Both records match on core identifiers "
                f"(email: '{c1.get('email')}', phone: '{c1.get('phone')}', address: '{c1.get('address')}') "
                f"with compatible name variations ('{c1.get('name')}' and '{c2.get('name')}')."
            ),
            "evidence": evidence
        }

    # Case 5: Low similarity across identifiers
    if overall_score < 0.50 and phone_sim < 0.5 and email_sim < 0.5:
        return {
            "decision": "PRESERVE",
            "confidence": 0.90,
            "reason": "Insufficient evidence of duplication; distinct entities.",
            "evidence": evidence
        }

    # Case 6: Fallback for borderline cases
    if intent["flag_uncertain"] or intent["conservative"]:
        return {
            "decision": "REVIEW",
            "confidence": round(overall_score, 2),
            "reason": f"Borderline similarity score ({round(overall_score, 2)}) with inconclusive evidence. Flagged for review.",
            "evidence": evidence
        }
    else:
        return {
            "decision": "PRESERVE",
            "confidence": round(1.0 - overall_score, 2),
            "reason": f"Similarity score ({round(overall_score, 2)}) does not meet merge criteria.",
            "evidence": evidence
        }


def investigate_candidate(candidate: Dict[str, Any], user_request: str) -> Dict[str, Any]:
    """
    Dual-mode AI Investigation:
    1. Uses OpenAI Chat Completions if available and functional.
    2. Falls back seamlessly with circuit-breaker to the autonomous reasoning engine.
    """
    global _openai_available

    client = get_openai_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if client and _openai_available:
        try:
            customer1 = candidate["customer1"]
            customer2 = candidate["customer2"]
            field_scores = candidate["field_scores"]
            conflicts = candidate.get("conflicts", [])

            prompt = f"""
You are an autonomous data-quality and deduplication investigation agent.

User Request:
"{user_request}"

Investigate whether these two customer records represent the same real-world customer:

Customer 1:
{json.dumps({k: v for k, v in customer1.items() if not k.endswith('_normalized') and k != 'name_info'}, indent=2)}

Customer 2:
{json.dumps({k: v for k, v in customer2.items() if not k.endswith('_normalized') and k != 'name_info'}, indent=2)}

Field Similarity Scores:
{json.dumps(field_scores, indent=2)}

Detected Conflicts:
{json.dumps(conflicts, indent=2)}

Investigation Rules:
1. Follow user directives strictly (e.g. conservative, do not merge names only, flag uncertain cases).
2. Do NOT merge customers just because their names match if other identifiers conflict.
3. Phone and email are strong primary identifiers.
4. Conflicting contact details or conflicting street/house numbers must prevent unsafe merges.
5. If evidence is ambiguous or uncertain, choose REVIEW.

Respond ONLY with a JSON object in this exact schema:
{{
    "decision": "MERGE" | "PRESERVE" | "REVIEW",
    "confidence": 0.0 to 1.0,
    "reason": "Clear explanation of the decision",
    "evidence": [
        "Key evidence item 1",
        "Key evidence item 2"
    ]
}}
"""
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a conservative, rigorous data-quality investigation agent. You always respond in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.0
            )

            raw_text = response.choices[0].message.content
            parsed = json.loads(raw_text)

            decision = parsed.get("decision", "").upper()
            if decision not in ["MERGE", "PRESERVE", "REVIEW"]:
                decision = "REVIEW"

            return {
                "decision": decision,
                "confidence": float(parsed.get("confidence", candidate.get("overall_score", 0.5))),
                "reason": str(parsed.get("reason", "Evaluated by AI model.")),
                "evidence": list(parsed.get("evidence", []))
            }
        except Exception as e:
            err_str = str(e).lower()
            if "quota" in err_str or "credit" in err_str or "auth" in err_str or "429" in err_str:
                logger.warning(f"OpenAI API quota/auth limitation detected ({e}). Tripping circuit-breaker to use autonomous reasoning engine.")
                _openai_available = False
            else:
                logger.warning(f"OpenAI call failed ({e}). Using autonomous reasoning engine.")

    # Autonomous reasoning engine
    return autonomous_reasoning_investigation(candidate, user_request)