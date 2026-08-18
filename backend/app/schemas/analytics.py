from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class DashboardAnalyticsResponse(BaseModel):
    total_students: int
    active_students: int
    at_risk_count: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_gpa: float
    average_attendance: float
    average_lms_engagement: float
    open_alerts_count: int
    risk_distribution: Dict[str, int]
    department_breakdown: List[Dict[str, Any]]
    cohort_trends: List[Dict[str, Any]]
    top_attrition_drivers: List[Dict[str, Any]]

class FERPAAuditLogResponse(BaseModel):
    id: int
    username: str
    user_role: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: str
    compliance_status: str
    timestamp: datetime

    class Config:
        from_attributes = True
