from datetime import datetime

def parse_iso_date(date_str: str):
    """
    Parse an ISO date string (YYYY-MM-DD) and return a datetime.date.
    Raises ValueError with a friendly message on failure.
    """
    try:
        return datetime.fromisoformat(date_str).date()
    except Exception:
        raise ValueError("must be ISO format YYYY-MM-DD")

def ensure_nonempty(value: str, field_name: str):
    """
    Return a trimmed string if non-empty; else raise ValueError("<field> is required").
    """
    if not (value or "").strip():
        raise ValueError(f"{field_name} is required")
    return value.strip()

def ensure_status(value: str):
    """
    Ensure status is one of {'open','done'}; returns the value or raises ValueError.
    """
    allowed = {"open", "done"}
    if value not in allowed:
        raise ValueError(f"status must be one of {sorted(allowed)}")
    return value
