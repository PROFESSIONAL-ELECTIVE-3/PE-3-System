"""Convert grades between a university scale and the model's 0–20 scale."""

MODEL_GRADE_MAXIMUM = 20.0
INVERSE_GWA_MAXIMUM = 5.0


def is_inverse_gwa_scale(grade_maximum: float) -> bool:
    """The local 1.0–5.0 GWA scale has 1.0 as its highest grade."""
    return float(grade_maximum) == INVERSE_GWA_MAXIMUM


def validate_grade_scale(grade: float, maximum: float) -> tuple[float, float]:
    """Return validated numeric values for a grade and its inclusive maximum."""
    try:
        grade = float(grade)
        maximum = float(maximum)
    except (TypeError, ValueError) as error:
        raise ValueError("Grade and grade maximum must be numbers.") from error

    if maximum <= 0:
        raise ValueError("Grade maximum must be greater than zero.")
    minimum = 1.0 if is_inverse_gwa_scale(maximum) else 0.0
    if not minimum <= grade <= maximum:
        raise ValueError(f"Grade must be between {minimum:g} and the selected grade maximum.")
    return grade, maximum


def to_model_scale(grade: float, grade_maximum: float) -> float:
    """Map a local grade to the model's 0–20 scale, where higher is better."""
    grade, grade_maximum = validate_grade_scale(grade, grade_maximum)
    if is_inverse_gwa_scale(grade_maximum):
        return (grade_maximum - grade) / (grade_maximum - 1) * MODEL_GRADE_MAXIMUM
    return grade / grade_maximum * MODEL_GRADE_MAXIMUM


def from_model_scale(model_grade: float, grade_maximum: float) -> float:
    """Map a 0–20 model result to the selected local grading scale.

    Linear regression can produce a value just outside its training range.
    The returned grade is therefore bounded to the valid 0–maximum range.
    """
    grade_maximum = float(grade_maximum)
    if grade_maximum <= 0:
        raise ValueError("Grade maximum must be greater than zero.")
    if is_inverse_gwa_scale(grade_maximum):
        local_grade = grade_maximum - float(model_grade) / MODEL_GRADE_MAXIMUM * (grade_maximum - 1)
        return max(1.0, min(local_grade, grade_maximum))
    local_grade = float(model_grade) / MODEL_GRADE_MAXIMUM * grade_maximum
    return max(0.0, min(local_grade, grade_maximum))


def predict_grade_on_scale(model, features, grade_maximum: float) -> float:
    """Predict a next-semester grade and return it on the requested scale.

    ``features`` must contain the model's 0–20 previous-semester grade column.
    Callers should convert that one input with ``to_model_scale`` before calling.
    """
    prediction = model.predict(features)[0]
    return from_model_scale(prediction, grade_maximum)
