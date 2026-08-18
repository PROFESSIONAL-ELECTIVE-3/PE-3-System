from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class EarlyWarningAlert(Base):
    __tablename__ = "early_warning_alerts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    
    alert_type = Column(String(50), nullable=False) # HIGH_ATTRITION_RISK, ATTENDANCE_DROP, GPA_CRITICAL, MULTIPLE_FAILURES, LMS_INACTIVITY
    severity = Column(String(20), nullable=False)   # CRITICAL, WARNING, INFO
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    trigger_metric = Column(String(100), nullable=True) # e.g. "attendance_rate", "risk_score"
    trigger_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student", back_populates="alerts")


class InterventionRecord(Base):
    __tablename__ = "intervention_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    advisor_name = Column(String(100), nullable=False)
    advisor_id = Column(Integer, nullable=True)
    
    title = Column(String(200), nullable=False)
    intervention_type = Column(String(50), nullable=False) # ACADEMIC_TUTORING, FINANCIAL_COUNSELING, MENTAL_HEALTH, ADVISING_SESSION, ATTENDANCE_CONTRACT
    status = Column(String(30), default="PLANNED")         # PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    priority = Column(String(20), default="MEDIUM")        # LOW, MEDIUM, HIGH, URGENT
    
    notes = Column(Text, nullable=True)
    action_plan = Column(Text, nullable=True)
    outcome_summary = Column(Text, nullable=True)
    
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    student = relationship("Student", back_populates="interventions")
