from typing import List, Dict, Any, Tuple
from rapidfuzz.fuzz import ratio, token_sort_ratio


def compare_names(c1: Dict[str, Any], c2: Dict[str, Any]) -> float:
    """
    Compares two customer names taking into account:
    - Exact matches
    - Initial to full name matching (e.g. 'S. Srirampur' vs 'Sneha Srirampur')
    - Minor typos (e.g. 'Sneha Srirampur' vs 'Sneh Srirampur')
    """
    n1 = c1.get("name_normalized", "")
    n2 = c2.get("name_normalized", "")

    if not n1 or not n2:
        return 0.0

    if n1 == n2:
        return 1.0

    info1 = c1.get("name_info", {})
    info2 = c2.get("name_info", {})

    last1 = info1.get("last", "")
    last2 = info2.get("last", "")
    first1 = info1.get("first", "")
    first2 = info2.get("first", "")

    # Check for initial match with identical last name (e.g., 's srirampur' vs 'sneha srirampur')
    if last1 and last2 and last1 == last2:
        # Check initial: length 1 vs word starting with that letter
        if (len(first1) == 1 and first2.startswith(first1)) or (len(first2) == 1 and first1.startswith(first2)):
            return 0.92

        # Check first name slight typo / nickname (e.g., 'sneha' vs 'sneh')
        first_sim = ratio(first1, first2) / 100.0
        if first_sim >= 0.75:
            return 0.90 + (first_sim * 0.08)

    # Use token sort ratio for name permutations / reordering
    ts_ratio = token_sort_ratio(n1, n2) / 100.0
    lev_ratio = ratio(n1, n2) / 100.0
    return max(ts_ratio, lev_ratio)


def compare_emails(c1: Dict[str, Any], c2: Dict[str, Any]) -> float:
    """
    Discrete email comparison:
    - Exact match: 1.0
    - Local parts differing by single character typo at same domain: 0.80
    - Different local parts: 0.0 (discrete identifier, not fuzzy)
    """
    e1 = c1.get("email_normalized", "")
    e2 = c2.get("email_normalized", "")

    if not e1 or not e2:
        return 0.0

    if e1 == e2:
        return 1.0

    domain1 = c1.get("email_domain", "")
    domain2 = c2.get("email_domain", "")
    local1 = c1.get("email_local", "")
    local2 = c2.get("email_local", "")

    if domain1 and domain2 and domain1 == domain2:
        # Check if local parts are very close (single character typo)
        loc_ratio = ratio(local1, local2) / 100.0
        # If usernames are like rahul1 and rahul2, they are different accounts
        if local1.rstrip("0123456789") == local2.rstrip("0123456789") and local1 != local2:
            return 0.0  # Numbered account variation indicates separate accounts
        if loc_ratio > 0.85 and abs(len(local1) - len(local2)) <= 1:
            return 0.75

    return 0.0


def compare_phones(c1: Dict[str, Any], c2: Dict[str, Any]) -> float:
    """
    Discrete phone comparison:
    - Phones are discrete identifiers, not fuzzy text.
    - Matching numbers: 1.0
    - Differing numbers: 0.0
    """
    p1 = c1.get("phone_normalized", "")
    p2 = c2.get("phone_normalized", "")

    if not p1 or not p2:
        return 0.0

    # Compare standard last 10 digits
    core1 = p1[-10:] if len(p1) >= 10 else p1
    core2 = p2[-10:] if len(p2) >= 10 else p2

    if core1 == core2:
        return 1.0

    return 0.0


def compare_addresses(c1: Dict[str, Any], c2: Dict[str, Any]) -> float:
    """
    Address comparison taking normalized street and house number into account.
    If house numbers differ, address similarity is heavily penalized.
    """
    a1 = c1.get("address_normalized", "")
    a2 = c2.get("address_normalized", "")

    if not a1 or not a2:
        return 0.0

    if a1 == a2:
        return 1.0

    h1 = c1.get("house_number")
    h2 = c2.get("house_number")

    # If house numbers exist and are different (e.g. 12 Lake Rd vs 14 Lake Rd)
    if h1 and h2 and h1 != h2:
        # Different house number means different building!
        return 0.20

    # Otherwise fuzzy ratio on normalized addresses
    return ratio(a1, a2) / 100.0


def compare_cities(c1: Dict[str, Any], c2: Dict[str, Any]) -> float:
    """City comparison."""
    ct1 = c1.get("city_normalized", "")
    ct2 = c2.get("city_normalized", "")

    if not ct1 or not ct2:
        return 0.0

    if ct1 == ct2:
        return 1.0

    return ratio(ct1, ct2) / 100.0


def compare_customers(c1: Dict[str, Any], c2: Dict[str, Any]) -> Dict[str, float]:
    """Computes similarity scores across all key dimensions."""
    return {
        "name": round(compare_names(c1, c2), 3),
        "email": round(compare_emails(c1, c2), 3),
        "phone": round(compare_phones(c1, c2), 3),
        "address": round(compare_addresses(c1, c2), 3),
        "city": round(compare_cities(c1, c2), 3),
    }


def detect_conflicts(c1: Dict[str, Any], c2: Dict[str, Any], scores: Dict[str, float]) -> List[str]:
    """Identifies clear conflicting pieces of evidence between two customer records."""
    conflicts = []

    # Conflicting phone numbers
    p1 = c1.get("phone_normalized")
    p2 = c2.get("phone_normalized")
    if p1 and p2 and p1 != p2:
        conflicts.append(f"Conflicting phone numbers: '{c1.get('phone')}' vs '{c2.get('phone')}'")

    # Conflicting emails
    e1 = c1.get("email_normalized")
    e2 = c2.get("email_normalized")
    if e1 and e2 and scores["email"] < 0.50:
        conflicts.append(f"Different email addresses: '{c1.get('email')}' vs '{c2.get('email')}'")

    # Conflicting house number / address
    h1 = c1.get("house_number")
    h2 = c2.get("house_number")
    if h1 and h2 and h1 != h2:
        conflicts.append(f"Conflicting house/street numbers: '{h1}' vs '{h2}' ('{c1.get('address')}' vs '{c2.get('address')}')")

    # Conflicting cities
    ct1 = c1.get("city_normalized")
    ct2 = c2.get("city_normalized")
    if ct1 and ct2 and scores["city"] < 0.70:
        conflicts.append(f"Different cities: '{c1.get('city')}' vs '{c2.get('city')}'")

    return conflicts


def calculate_overall_score(scores: Dict[str, float]) -> float:
    """
    Weighted similarity score.
    Higher weight given to strong identifiers (email, phone).
    """
    weighted = (
        scores["name"] * 0.25 +
        scores["email"] * 0.30 +
        scores["phone"] * 0.30 +
        scores["address"] * 0.10 +
        scores["city"] * 0.05
    )
    return round(weighted, 3)


def find_candidates(customers: List[Dict[str, Any]], threshold: float = 0.35) -> List[Dict[str, Any]]:
    """
    Deterministic candidate pair generator.
    Generates candidate pairs if they share key attributes or surpass threshold.
    """
    candidates = []
    n = len(customers)

    for i in range(n):
        for j in range(i + 1, n):
            c1 = customers[i]
            c2 = customers[j]

            scores = compare_customers(c1, c2)
            overall_score = calculate_overall_score(scores)
            conflicts = detect_conflicts(c1, c2, scores)

            # Inclusion criteria:
            # 1. Overall score meets threshold
            # 2. Or exact phone match
            # 3. Or exact email match
            # 4. Or high name similarity (e.g. Test B: same name, different person)
            # 5. Or high address similarity
            is_candidate = (
                overall_score >= threshold
                or scores["phone"] >= 0.99
                or scores["email"] >= 0.99
                or scores["name"] >= 0.85
                or scores["address"] >= 0.85
            )

            if is_candidate:
                candidates.append({
                    "customer1": c1,
                    "customer2": c2,
                    "field_scores": scores,
                    "overall_score": overall_score,
                    "conflicts": conflicts
                })

    return candidates