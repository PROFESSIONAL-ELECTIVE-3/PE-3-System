"""Shared dropout-probability tiers for the API and model evaluation."""

HIGH_RISK_THRESHOLD = 0.40
MEDIUM_RISK_THRESHOLD = 0.20


def risk_level(dropout_probability: float) -> str:
    if dropout_probability >= HIGH_RISK_THRESHOLD:
        return "high"
    if dropout_probability >= MEDIUM_RISK_THRESHOLD:
        return "medium"
    return "low"
