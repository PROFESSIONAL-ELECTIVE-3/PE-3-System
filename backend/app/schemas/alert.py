from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EarlyWarningAlertResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    student_identifier: Optional[str] = None
    major: Optional[str] = None
    alert_type: str
    severity: str
    title: str
    message: str
    trigger_metric: Optional[str] = None
    trigger_value: Optional[float] = None
    threshold_value: Optional[float] = None
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EarlyWarningAlertResolve(BaseModel):
    resolution_notes: str

class InterventionCreate(BaseModel):
    student_id: int
    title: str
    intervention_type: str  # ACADEMIC_TUTORING, FINANCIAL_COUNSELING, MENTAL_HEALTH, ADVISING_SESSION, ATTENDANCE_CONTRACT
    priority: str = "MEDIUM"
    notes: Optional[str] = None
    action_plan: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None  # PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    notes: Optional[str] = None
    action_plan: Optional[str] = None
    outcome_summary: Optional[str] = None
    follow_up_date: Optional[datetime] = None

class InterventionResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    student_identifier: Optional[str] = None
    advisor_name: str
    advisor_id: Optional[int] = None
    title: str
    intervention_type: str
    status: str
    priority: str
    notes: Optional[str] = None
    action_plan: Optional[str] = None
    outcome_summary: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
