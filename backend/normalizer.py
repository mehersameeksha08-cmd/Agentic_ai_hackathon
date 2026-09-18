import re
from typing import Dict, Any, Optional


# Common street suffix abbreviations mapping
STREET_ABBREVIATIONS = {
    r"\brd\b": "road",
    r"\bst\b": "street",
    r"\bave\b": "avenue",
    r"\bblvd\b": "boulevard",
    r"\bdr\b": "drive",
    r"\bln\b": "lane",
    r"\bct\b": "court",
    r"\bpl\b": "place",
    r"\bapt\b": "apartment",
    r"\bste\b": "suite",
    r"\bfl\b": "floor",
    r"\bpkwy\b": "parkway",
    r"\bhwy\b": "highway",
}

HONORIFICS = {r"\bmr\b": "", r"\bmrs\b": "", r"\bms\b": "", r"\bdr\b": "", r"\bprof\b": ""}


def normalize_text(value: Optional[str]) -> str:
    """General text normalization: lowercased, stripped, extra whitespace removed."""
    if value is None:
        return ""
    val_str = str(value).lower().strip()
    # Replace multiple whitespaces and newlines
    val_str = re.sub(r"\s+", " ", val_str)
    return val_str


def normalize_address(address: Optional[str]) -> str:
    """
    Normalizes address strings by expanding standard abbreviations
    (e.g., '12 Lake Rd' -> '12 lake road').
    """
    if not address:
        return ""

    addr = normalize_text(address)
    # Remove punctuation except alphanumeric and spaces
    addr = re.sub(r"[^\w\s]", "", addr)
    addr = re.sub(r"\s+", " ", addr).strip()

    # Expand abbreviations
    for pattern, replacement in STREET_ABBREVIATIONS.items():
        addr = re.sub(pattern, replacement, addr)

    return addr


def extract_house_number(address: Optional[str]) -> Optional[str]:
    """Extracts leading or standalone house/building number from address."""
    if not address:
        return None
    match = re.search(r"\b(\d+)\b", str(address))
    return match.group(1) if match else None


def normalize_email(email: Optional[str]) -> str:
    """Normalizes email: lowercase, stripped of spaces and invalid chars."""
    if not email:
        return ""
    email_str = str(email).lower().strip()
    return email_str


def get_email_parts(email: Optional[str]):
    """Splits email into local part and domain."""
    norm = normalize_email(email)
    if "@" in norm:
        parts = norm.split("@", 1)
        return parts[0].strip(), parts[1].strip()
    return norm, ""


def normalize_phone(phone: Optional[str]) -> str:
    """
    Normalizes phone numbers to pure digits.
    Standardizes international/country prefixes when applicable (e.g. +91 9876543210 -> 9876543210).
    """
    if not phone:
        return ""

    digits = re.sub(r"\D", "", str(phone))
    # If 12 digits starting with 91 (India) or 11 starting with 1 (US), extract national 10-digit number
    if len(digits) == 12 and digits.startswith("91"):
        return digits[2:]
    if len(digits) == 11 and digits.startswith("1"):
        return digits[1:]
    if len(digits) == 11 and digits.startswith("0"):
        return digits[1:]

    return digits


def normalize_name(name: Optional[str]) -> str:
    """Normalizes customer full name, removing titles and punctuation."""
    if not name:
        return ""

    norm = normalize_text(name)
    # Strip punctuation
    norm = re.sub(r"[^\w\s]", " ", norm)
    norm = re.sub(r"\s+", " ", norm).strip()

    # Strip honorifics
    for hon in HONORIFICS:
        norm = re.sub(hon, "", norm)

    norm = re.sub(r"\s+", " ", norm).strip()
    return norm


def get_name_tokens(name: Optional[str]) -> Dict[str, Any]:
    """Extracts name parts: first, last, tokens, and initials."""
    norm = normalize_name(name)
    tokens = [t for t in norm.split() if t]
    first = tokens[0] if tokens else ""
    last = tokens[-1] if len(tokens) > 1 else ""
    initials = "".join([t[0] for t in tokens if t])
    return {
        "full": norm,
        "tokens": tokens,
        "first": first,
        "last": last,
        "initials": initials,
    }


def normalize_customer(customer: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates normalized representations for all core customer attributes.
    Preserves original fields while augmenting with normalized counterparts.
    """
    cleaned = customer.copy()

    # Ensure required base keys exist
    customer_id = str(customer.get("customer_id") or customer.get("id") or "")
    cleaned["customer_id"] = customer_id
    name = str(customer.get("name") or "")
    email = str(customer.get("email") or "")
    phone = str(customer.get("phone") or "")
    address = str(customer.get("address") or "")
    city = str(customer.get("city") or "")
    last_updated = str(customer.get("last_updated") or "")
    source = str(customer.get("source") or "")

    cleaned["name"] = name
    cleaned["email"] = email
    cleaned["phone"] = phone
    cleaned["address"] = address
    cleaned["city"] = city
    cleaned["last_updated"] = last_updated
    cleaned["source"] = source

    # Add normalized fields
    cleaned["name_normalized"] = normalize_name(name)
    cleaned["name_info"] = get_name_tokens(name)
    cleaned["email_normalized"] = normalize_email(email)
    email_local, email_domain = get_email_parts(email)
    cleaned["email_local"] = email_local
    cleaned["email_domain"] = email_domain

    cleaned["phone_normalized"] = normalize_phone(phone)
    cleaned["address_normalized"] = normalize_address(address)
    cleaned["house_number"] = extract_house_number(address)
    cleaned["city_normalized"] = normalize_text(city)

    return cleaned