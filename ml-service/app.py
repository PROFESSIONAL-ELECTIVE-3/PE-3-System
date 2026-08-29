"""FastAPI service exposing the trained student forecasting models."""

from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator

from grading_scale import from_model_scale, to_model_scale


BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
GRADE_MODEL_PATH = ARTIFACTS_DIR / "grade_model_optimized.joblib"
RISK_MODEL_PATH = ARTIFACTS_DIR / "risk_model_optimized.joblib"


class PredictionInput(BaseModel):
    educationalSpecialNeeds: bool
    tuitionFeeStatus: bool
    scholarshipStatus: bool
    studySchedule: Literal["day", "night"]
    previousSemesterUnitsEnrolled: int = Field(ge=1, le=100)
    previousSemesterUnitsApproved: int = Field(ge=0, le=100)
    previousSemesterGrade: float = Field(ge=0)
    gradeMaximum: float = Field(default=20, gt=0, le=100)

    @model_validator(mode="after")
    def validate_academic_values(self):
        if self.previousSemesterUnitsApproved > self.previousSemesterUnitsEnrolled:
            raise ValueError("Approved units cannot exceed enrolled units.")
        if self.previousSemesterGrade > self.gradeMaximum:
            raise ValueError("Previous-semester grade cannot exceed the grade maximum.")
        return self


def load_model(path: Path):
    if not path.exists():
        raise RuntimeError(f"Required model artifact is missing: {path.name}")
    return joblib.load(path)


try:
    grade_model = load_model(GRADE_MODEL_PATH)
    risk_model = load_model(RISK_MODEL_PATH)
    model_load_error = None
except Exception as error:  # Service stays observable even if artifacts are missing.
    grade_model = None
    risk_model = None
    model_load_error = str(error)


app = FastAPI(title="EduForecaster ML Service", version="1.0.0")


def risk_level(dropout_probability: float) -> str:
    if dropout_probability >= 0.40:
        return "high"
    if dropout_probability >= 0.20:
        return "moderate"
    return "low"


def to_model_features(payload: PredictionInput) -> pd.DataFrame:
    completion_rate = payload.previousSemesterUnitsApproved / payload.previousSemesterUnitsEnrolled
    return pd.DataFrame([
        {
            "Educational special needs": int(payload.educationalSpecialNeeds),
            "Tuition fees up to date": int(payload.tuitionFeeStatus),
            "Scholarship holder": int(payload.scholarshipStatus),
            # Kaggle coding: 1 = daytime, 0 = evening.
            "Daytime/evening attendance": 1 if payload.studySchedule == "day" else 0,
            "Curricular units 1st sem (enrolled)": payload.previousSemesterUnitsEnrolled,
            "Curricular units 1st sem (approved)": payload.previousSemesterUnitsApproved,
            "Semester 1 completion rate": completion_rate,
            "Curricular units 1st sem (grade)": to_model_scale(
                payload.previousSemesterGrade, payload.gradeMaximum
            ),
        }
    ])


@app.get("/health")
def health():
    return {
        "status": "ok" if model_load_error is None else "degraded",
        "gradeModel": GRADE_MODEL_PATH.name,
        "riskModel": RISK_MODEL_PATH.name,
        "error": model_load_error,
    }


@app.post("/predict")
def predict(payload: PredictionInput):
    if model_load_error is not None:
        raise HTTPException(status_code=503, detail="Prediction models are unavailable.")

    features = to_model_features(payload)
    predicted_model_grade = float(grade_model.predict(features)[0])
    predicted_grade = from_model_scale(predicted_model_grade, payload.gradeMaximum)

    outcome = str(risk_model.predict(features)[0])
    probabilities = {
        str(label): float(probability)
        for label, probability in zip(risk_model.classes_, risk_model.predict_proba(features)[0])
    }
    dropout_probability = probabilities.get("Dropout", 0.0)

    return {
        "predictedNextSemesterGrade": round(predicted_grade, 2),
        "gradeMaximum": payload.gradeMaximum,
        "predictedOutcome": outcome,
        "dropoutProbability": round(dropout_probability, 4),
        "riskLevel": risk_level(dropout_probability),
        "outcomeProbabilities": {key: round(value, 4) for key, value in probabilities.items()},
        "completionRate": round(payload.previousSemesterUnitsApproved / payload.previousSemesterUnitsEnrolled, 4),
        "modelVersion": "optimized-2026-08-29",
    }
