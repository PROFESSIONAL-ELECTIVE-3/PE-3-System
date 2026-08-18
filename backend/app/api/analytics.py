from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.student import Student
from app.models.prediction import RiskPrediction
from app.models.alert import EarlyWarningAlert
from app.models.audit import FERPAAuditLog
from app.schemas.analytics import DashboardAnalyticsResponse, FERPAAuditLogResponse

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics & FERPA Audits"])

@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    active_students = db.query(Student).filter(Student.status == "Active").count()
    
    # Compute risk distribution from latest risk prediction per student
    students = db.query(Student).all()
    high_count = 0
    medium_count = 0
    low_count = 0
    
    total_gpa = 0.0
    total_attendance = 0.0
    total_lms = 0.0
    
    for s in students:
        total_gpa += s.current_gpa
        total_attendance += s.attendance_rate
        total_lms += s.lms_engagement_score
        
        latest_pred = db.query(RiskPrediction).filter(RiskPrediction.student_id == s.id).order_by(RiskPrediction.predicted_at.desc()).first()
        if latest_pred:
            if latest_pred.risk_level == "High":
                high_count += 1
            elif latest_pred.risk_level == "Medium":
                medium_count += 1
            else:
                low_count += 1
        else:
            low_count += 1
            
    avg_gpa = round(total_gpa / total_students, 2) if total_students > 0 else 0.0
    avg_attendance = round(total_attendance / total_students, 1) if total_students > 0 else 0.0
    avg_lms = round(total_lms / total_students, 1) if total_students > 0 else 0.0
    
    open_alerts = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.is_resolved == False).count()
    at_risk = high_count + medium_count
    
    risk_distribution = {
        "Low Risk": low_count,
        "Medium Risk": medium_count,
        "High Risk": high_count
    }
    
    # Department breakdown
    dept_query = db.query(Student.department, func.count(Student.id)).group_by(Student.department).all()
    department_breakdown = [{"department": d, "count": c} for d, c in dept_query]
    
    # Cohort trends
    cohort_query = db.query(Student.cohort, func.count(Student.id), func.avg(Student.current_gpa)).group_by(Student.cohort).all()
    cohort_trends = [{"cohort": co, "count": cnt, "average_gpa": round(g, 2)} for co, cnt, g in cohort_query]
    
    top_drivers = [
        {"factor": "Low Attendance Rate (<75%)", "impact_weight": 0.35, "affected_students_pct": 24.5},
        {"factor": "Low LMS Portal Engagement", "impact_weight": 0.28, "affected_students_pct": 31.2},
        {"factor": "Course Failure History", "impact_weight": 0.22, "affected_students_pct": 18.0},
        {"factor": "First-Generation & Socio-Economic Stressors", "impact_weight": 0.15, "affected_students_pct": 38.4}
    ]
    
    return {
        "total_students": total_students,
        "active_students": active_students,
        "at_risk_count": at_risk,
        "high_risk_count": high_count,
        "medium_risk_count": medium_count,
        "low_risk_count": low_count,
        "average_gpa": avg_gpa,
        "average_attendance": avg_attendance,
        "average_lms_engagement": avg_lms,
        "open_alerts_count": open_alerts,
        "risk_distribution": risk_distribution,
        "department_breakdown": department_breakdown,
        "cohort_trends": cohort_trends,
        "top_attrition_drivers": top_drivers
    }

@router.get("/ferpa-logs", response_model=List[FERPAAuditLogResponse])
def get_ferpa_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(FERPAAuditLog).order_by(FERPAAuditLog.timestamp.desc()).limit(100).all()
    return logs
