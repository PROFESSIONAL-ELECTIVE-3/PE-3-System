from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: EmailStr
    major: str
    department: str
    enrollment_year: int = 2024
    cohort: str = "Cohort 2024"
    academic_standing: str = "Good Standing"
    status: str = "Active"
    
    current_gpa: float = Field(..., ge=0.0, le=4.0)
    cumulative_gpa: float = Field(..., ge=0.0, le=4.0)
    high_school_gpa: float = Field(default=3.0, ge=0.0, le=4.0)
    credits_attempted: float = Field(default=15.0, ge=0.0)
    credits_earned: float = Field(default=15.0, ge=0.0)
    credit_completion_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    midterm_average: float = Field(default=75.0, ge=0.0, le=100.0)
    course_failure_count: int = Field(default=0, ge=0)
    
    attendance_rate: float = Field(default=90.0, ge=0.0, le=100.0)
    lms_engagement_score: float = Field(default=80.0, ge=0.0, le=100.0)
    study_hours_per_week: float = Field(default=15.0, ge=0.0)
    
    first_generation_student: bool = False
    financial_aid_status: str = "None"
    socio_economic_index: float = Field(default=50.0, ge=0.0, le=100.0)
    commute_time_minutes: int = Field(default=20, ge=0)
    employment_hours_per_week: int = Field(default=10, ge=0)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    major: Optional[str] = None
    department: Optional[str] = None
    academic_standing: Optional[str] = None
    status: Optional[str] = None
    
    current_gpa: Optional[float] = None
    cumulative_gpa: Optional[float] = None
    midterm_average: Optional[float] = None
    course_failure_count: Optional[int] = None
    attendance_rate: Optional[float] = None
    lms_engagement_score: Optional[float] = None
    study_hours_per_week: Optional[float] = None
    financial_aid_status: Optional[str] = None
    socio_economic_index: Optional[float] = None
    employment_hours_per_week: Optional[int] = None

class RiskPredictionBrief(BaseModel):
    risk_level: str
    risk_score: float
    confidence_score: float
    predicted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PerformanceForecastBrief(BaseModel):
    forecast_term: str
    predicted_gpa: float
    grade_trajectory: str
    lower_bound_gpa: Optional[float] = None
    upper_bound_gpa: Optional[float] = None

    class Config:
        from_attributes = True

class StudentResponse(StudentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    latest_risk: Optional[RiskPredictionBrief] = None
    latest_forecast: Optional[PerformanceForecastBrief] = None
    active_alerts_count: int = 0

    class Config:
        from_attributes = True

class StudentListResponse(BaseModel):
    items: List[StudentResponse]
    total: int
    page: int
    size: int
    pages: int
