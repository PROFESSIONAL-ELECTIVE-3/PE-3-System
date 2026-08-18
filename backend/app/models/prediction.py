from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    
    risk_level = Column(String(20), nullable=False)  # "Low", "Medium", "High"
    risk_score = Column(Float, nullable=False)        # Probability of attrition 0.00 - 1.00
    confidence_score = Column(Float, nullable=False)  # e.g. 0.85
    
    # Explainable AI Factors (JSON list or dict)
    top_risk_factors = Column(JSON, nullable=True)     # e.g. [{"factor": "Low Attendance", "weight": 0.35}, ...]
    positive_factors = Column(JSON, nullable=True)     # e.g. [{"factor": "High LMS Engagement", "weight": 0.20}, ...]
    recommended_actions = Column(JSON, nullable=True)  # List of suggested advisor interventions
    
    model_version = Column(String(50), default="XGBoost_v1.0")
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student", back_populates="predictions")


class PerformanceForecast(Base):
    __tablename__ = "performance_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    
    forecast_term = Column(String(50), nullable=False)  # e.g. "Next Semester (Fall 2026)"
    predicted_gpa = Column(Float, nullable=False)       # Predicted GPA (0.00 - 4.00)
    lower_bound_gpa = Column(Float, nullable=True)     # 95% Confidence interval lower
    upper_bound_gpa = Column(Float, nullable=True)     # 95% Confidence interval upper
    grade_trajectory = Column(String(30), nullable=False) # "Improving", "Stable", "Declining", "Critical Drop"
    
    model_version = Column(String(50), default="GradientBoostingRegressor_v1.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student", back_populates="forecasts")
