"""Convert grades between a university scale and the model's 0–20 scale."""

MODEL_GRADE_MAXIMUM = 20.0


def validate_grade_scale(grade: float, maximum: float) -> tuple[float, float]:
    """Return validated numeric values for a grade and its inclusive maximum."""
    try:
        grade = float(grade)
        maximum = float(maximum)
    except (TypeError, ValueError) as error:
        raise ValueError("Grade and grade maximum must be numbers.") from error

    if maximum <= 0:
        raise ValueError("Grade maximum must be greater than zero.")
    if not 0 <= grade <= maximum:
        raise ValueError("Grade must be between zero and the selected grade maximum.")
    return grade, maximum


def to_model_scale(grade: float, grade_maximum: float) -> float:
    """Map a local grade such as 85/100 or 3.2/4 to the 0–20 model scale."""
    grade, grade_maximum = validate_grade_scale(grade, grade_maximum)
    return grade / grade_maximum * MODEL_GRADE_MAXIMUM


def from_model_scale(model_grade: float, grade_maximum: float) -> float:
    """Map a 0–20 model result to the selected local grading scale.

    Linear regression can produce a value just outside its training range.
    The returned grade is therefore bounded to the valid 0–maximum range.
    """
    _, grade_maximum = validate_grade_scale(0, grade_maximum)
    local_grade = float(model_grade) / MODEL_GRADE_MAXIMUM * grade_maximum
    return max(0.0, min(local_grade, grade_maximum))


def predict_grade_on_scale(model, features, grade_maximum: float) -> float:
    """Predict a next-semester grade and return it on the requested scale.

    ``features`` must contain the model's 0–20 previous-semester grade column.
    Callers should convert that one input with ``to_model_scale`` before calling.
    """
    prediction = model.predict(features)[0]
    return from_model_scale(prediction, grade_maximum)
