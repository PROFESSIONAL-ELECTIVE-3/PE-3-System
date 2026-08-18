from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class FactorExplanation(BaseModel):
    factor: str
    weight: float
    direction: str  # "increase_risk", "reduce_risk", "neutral"
    description: str

class RiskPredictionResponse(BaseModel):
    id: Optional[int] = None
    student_id: int
    student_identifier: Optional[str] = None
    risk_level: str  # "Low", "Medium", "High"
    risk_score: float  # 0.00 to 1.00
    confidence_score: float
    top_risk_factors: List[Dict[str, Any]]
    positive_factors: List[Dict[str, Any]]
    recommended_actions: List[str]
    model_version: str
    predicted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PerformanceForecastResponse(BaseModel):
    id: Optional[int] = None
    student_id: int
    student_identifier: Optional[str] = None
    forecast_term: str
    predicted_gpa: float
    lower_bound_gpa: Optional[float] = None
    upper_bound_gpa: Optional[float] = None
    grade_trajectory: str  # "Improving", "Stable", "Declining", "Critical Drop"
    model_version: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PredictionInputFeatures(BaseModel):
    current_gpa: float = Field(..., ge=0.0, le=4.0)
    cumulative_gpa: float = Field(..., ge=0.0, le=4.0)
    high_school_gpa: float = Field(default=3.0, ge=0.0, le=4.0)
    credit_completion_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    midterm_average: float = Field(default=75.0, ge=0.0, le=100.0)
    course_failure_count: int = Field(default=0, ge=0)
    attendance_rate: float = Field(default=90.0, ge=0.0, le=100.0)
    lms_engagement_score: float = Field(default=80.0, ge=0.0, le=100.0)
    study_hours_per_week: float = Field(default=15.0, ge=0.0)
    first_generation_student: bool = False
    socio_economic_index: float = Field(default=50.0, ge=0.0, le=100.0)
    employment_hours_per_week: int = Field(default=10, ge=0)
    commute_time_minutes: int = Field(default=20, ge=0)
    department: str = "Computer Science"
    financial_aid_status: str = "Partial Grant"

class WhatIfSimulationRequest(BaseModel):
    student_id: Optional[int] = None
    base_features: PredictionInputFeatures
    simulated_attendance_rate: Optional[float] = None
    simulated_study_hours: Optional[float] = None
    simulated_midterm_average: Optional[float] = None
    simulated_lms_engagement: Optional[float] = None
    simulated_employment_hours: Optional[int] = None

class WhatIfSimulationResponse(BaseModel):
    baseline_risk_level: str
    baseline_risk_score: float
    baseline_predicted_gpa: float
    simulated_risk_level: str
    simulated_risk_score: float
    simulated_predicted_gpa: float
    risk_score_delta: float
    gpa_delta: float
    impact_summary: str
    key_drivers_changed: List[Dict[str, Any]]
