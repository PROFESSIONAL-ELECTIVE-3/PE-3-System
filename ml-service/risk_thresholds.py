"""Shared dropout-probability tiers for the API and model evaluation."""

HIGH_RISK_THRESHOLD = 0.40
MODERATE_RISK_THRESHOLD = 0.20


def risk_level(dropout_probability: float) -> str:
    if dropout_probability >= HIGH_RISK_THRESHOLD:
        return "high"
    if dropout_probability >= MODERATE_RISK_THRESHOLD:
        return "moderate"
    return "low"
