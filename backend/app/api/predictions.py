from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.prediction import RiskPrediction
from app.schemas.prediction import RiskPredictionResponse, PerformanceForecastResponse, WhatIfSimulationRequest, WhatIfSimulationResponse
from app.ml.pipeline import AcademicMLPipeline
from app.config import settings

router = APIRouter(prefix="/predictions", tags=["ML Inference & What-If Simulator"])
ml_pipeline = AcademicMLPipeline(settings.MODELS_DIR)

@router.post("/evaluate", response_model=RiskPredictionResponse)
def evaluate_student_features(features: dict):
    pred_res = ml_pipeline.predict_student(features)
    return {
        "student_id": 0,
        "student_identifier": "Ad-Hoc Evaluation",
        **pred_res
    }

@router.post("/what-if", response_model=WhatIfSimulationResponse)
def what_if_simulation(sim_request: WhatIfSimulationRequest, db: Session = Depends(get_db)):
    base = sim_request.base_features.model_dump()
    
    # Run baseline prediction
    baseline_res = ml_pipeline.predict_student(base)
    
    # Apply simulated modifications
    simulated = base.copy()
    changes_made = []
    
    if sim_request.simulated_attendance_rate is not None:
        old_val = simulated["attendance_rate"]
        simulated["attendance_rate"] = sim_request.simulated_attendance_rate
        changes_made.append({"parameter": "Attendance Rate", "from": old_val, "to": sim_request.simulated_attendance_rate})
        
    if sim_request.simulated_study_hours is not None:
        old_val = simulated["study_hours_per_week"]
        simulated["study_hours_per_week"] = sim_request.simulated_study_hours
        changes_made.append({"parameter": "Study Hours / Week", "from": old_val, "to": sim_request.simulated_study_hours})
        
    if sim_request.simulated_midterm_average is not None:
        old_val = simulated["midterm_average"]
        simulated["midterm_average"] = sim_request.simulated_midterm_average
        changes_made.append({"parameter": "Midterm Average", "from": old_val, "to": sim_request.simulated_midterm_average})
        
    if sim_request.simulated_lms_engagement is not None:
        old_val = simulated["lms_engagement_score"]
        simulated["lms_engagement_score"] = sim_request.simulated_lms_engagement
        changes_made.append({"parameter": "LMS Engagement Score", "from": old_val, "to": sim_request.simulated_lms_engagement})
        
    if sim_request.simulated_employment_hours is not None:
        old_val = simulated["employment_hours_per_week"]
        simulated["employment_hours_per_week"] = sim_request.simulated_employment_hours
        changes_made.append({"parameter": "Employment Hours", "from": old_val, "to": sim_request.simulated_employment_hours})
        
    sim_res = ml_pipeline.predict_student(simulated)
    
    risk_delta = round(sim_res["risk_score"] - baseline_res["risk_score"], 3)
    gpa_delta = round(sim_res["predicted_gpa"] - baseline_res["predicted_gpa"], 2)
    
    impact = f"Simulated changes resulted in a GPA change of {gpa_delta:+.2f} and attrition risk score shift of {risk_delta * 100:+.1f}%."
    
    return {
        "baseline_risk_level": baseline_res["risk_level"],
        "baseline_risk_score": baseline_res["risk_score"],
        "baseline_predicted_gpa": baseline_res["predicted_gpa"],
        "simulated_risk_level": sim_res["risk_level"],
        "simulated_risk_score": sim_res["risk_score"],
        "simulated_predicted_gpa": sim_res["predicted_gpa"],
        "risk_score_delta": risk_delta,
        "gpa_delta": gpa_delta,
        "impact_summary": impact,
        "key_drivers_changed": changes_made
    }
