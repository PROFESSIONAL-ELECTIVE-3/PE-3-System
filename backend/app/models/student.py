from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    
    major = Column(String(100), index=True, nullable=False)
    department = Column(String(100), index=True, nullable=False)
    enrollment_year = Column(Integer, nullable=False)
    cohort = Column(String(50), nullable=False)  # e.g., "Cohort 2024"
    academic_standing = Column(String(50), default="Good Standing")  # Good Standing, Probation, Warning
    status = Column(String(30), default="Active")  # Active, On Leave, Dropped Out, Graduated
    
    # Academic Indicators
    current_gpa = Column(Float, default=3.0)
    cumulative_gpa = Column(Float, default=3.0)
    high_school_gpa = Column(Float, default=3.2)
    credits_attempted = Column(Float, default=15.0)
    credits_earned = Column(Float, default=15.0)
    credit_completion_rate = Column(Float, default=1.0)
    midterm_average = Column(Float, default=75.0)
    course_failure_count = Column(Integer, default=0)
    
    # Engagement & Behavioral Indicators
    attendance_rate = Column(Float, default=90.0)  # Percentage 0-100
    lms_engagement_score = Column(Float, default=80.0)  # Scale 0-100
    study_hours_per_week = Column(Float, default=15.0)
    
    # Demographic & Socio-economic Indicators
    first_generation_student = Column(Boolean, default=False)
    financial_aid_status = Column(String(50), default="None")  # None, Partial Grant, Full Scholarship, Pell Grant
    socio_economic_index = Column(Float, default=50.0)  # Scale 0-100
    commute_time_minutes = Column(Integer, default=20)
    employment_hours_per_week = Column(Integer, default=10)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    predictions = relationship("RiskPrediction", back_populates="student", cascade="all, delete-orphan")
    forecasts = relationship("PerformanceForecast", back_populates="student", cascade="all, delete-orphan")
    alerts = relationship("EarlyWarningAlert", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("InterventionRecord", back_populates="student", cascade="all, delete-orphan")
