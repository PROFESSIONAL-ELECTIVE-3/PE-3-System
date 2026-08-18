from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.student import Student
from app.models.prediction import RiskPrediction, PerformanceForecast
from app.models.alert import EarlyWarningAlert
from app.models.audit import FERPAAuditLog
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentListResponse, RiskPredictionBrief, PerformanceForecastBrief
from app.ml.pipeline import AcademicMLPipeline
from app.config import settings

router = APIRouter(prefix="/students", tags=["Students Management & Analytics"])
ml_pipeline = AcademicMLPipeline(settings.MODELS_DIR)

@router.get("", response_model=StudentListResponse)
def get_students(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(search_filter)) |
            (Student.last_name.ilike(search_filter)) |
            (Student.student_id.ilike(search_filter)) |
            (Student.email.ilike(search_filter)) |
            (Student.major.ilike(search_filter))
        )
        
    if department:
        query = query.filter(Student.department == department)
        
    total = query.count()
    pages = (total + size - 1) // size if total > 0 else 1
    offset = (page - 1) * size
    students = query.offset(offset).limit(size).all()
    
    result_items = []
    for s in students:
        latest_pred = db.query(RiskPrediction).filter(RiskPrediction.student_id == s.id).order_by(RiskPrediction.predicted_at.desc()).first()
        latest_fore = db.query(PerformanceForecast).filter(PerformanceForecast.student_id == s.id).order_by(PerformanceForecast.created_at.desc()).first()
        active_alerts = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.student_id == s.id, EarlyWarningAlert.is_resolved == False).count()
        
        # Filter by risk level if requested
        if risk_level:
            if not latest_pred or latest_pred.risk_level.lower() != risk_level.lower():
                continue
                
        s_resp = StudentResponse.model_validate(s)
        if latest_pred:
            s_resp.latest_risk = RiskPredictionBrief.model_validate(latest_pred)
        if latest_fore:
            s_resp.latest_forecast = PerformanceForecastBrief.model_validate(latest_fore)
        s_resp.active_alerts_count = active_alerts
        result_items.append(s_resp)
        
    return {
        "items": result_items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.student_id == student_in.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student with ID {student_in.student_id} already exists")
        
    student_data = student_in.model_dump()
    student = Student(**student_data)
    db.add(student)
    db.commit()
    db.refresh(student)
    
    # Run initial ML prediction
    pred_res = ml_pipeline.predict_student(student_data)
    
    risk_pred = RiskPrediction(
        student_id=student.id,
        risk_level=pred_res["risk_level"],
        risk_score=pred_res["risk_score"],
        confidence_score=pred_res["confidence_score"],
        top_risk_factors=pred_res["top_risk_factors"],
        positive_factors=pred_res["positive_factors"],
        recommended_actions=pred_res["recommended_actions"],
        model_version=pred_res["model_version"]
    )
    db.add(risk_pred)
    
    perf_forecast = PerformanceForecast(
        student_id=student.id,
        forecast_term="Next Semester (Fall 2026)",
        predicted_gpa=pred_res["predicted_gpa"],
        lower_bound_gpa=pred_res["lower_bound_gpa"],
        upper_bound_gpa=pred_res["upper_bound_gpa"],
        grade_trajectory=pred_res["grade_trajectory"],
        model_version=pred_res["model_version"]
    )
    db.add(perf_forecast)
    db.commit()
    
    # FERPA Audit Log
    audit = FERPAAuditLog(
        username="system_admin",
        user_role="admin",
        action="CREATE_STUDENT",
        resource_type="STUDENT",
        resource_id=student.student_id,
        details=f"Created student record for {student.first_name} {student.last_name}",
        compliance_status="COMPLIANT"
    )
    db.add(audit)
    db.commit()
    
    s_resp = StudentResponse.model_validate(student)
    s_resp.latest_risk = RiskPredictionBrief.model_validate(risk_pred)
    s_resp.latest_forecast = PerformanceForecastBrief.model_validate(perf_forecast)
    return s_resp

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    latest_pred = db.query(RiskPrediction).filter(RiskPrediction.student_id == student.id).order_by(RiskPrediction.predicted_at.desc()).first()
    latest_fore = db.query(PerformanceForecast).filter(PerformanceForecast.student_id == student.id).order_by(PerformanceForecast.created_at.desc()).first()
    active_alerts = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.student_id == student.id, EarlyWarningAlert.is_resolved == False).count()
    
    # FERPA Audit Log for viewing sensitive record
    audit = FERPAAuditLog(
        username="faculty_advisor",
        user_role="advisor",
        action="VIEW_RECORD",
        resource_type="STUDENT",
        resource_id=student.student_id,
        details=f"Accessed academic and risk record for student {student.student_id}",
        compliance_status="COMPLIANT"
    )
    db.add(audit)
    db.commit()
    
    s_resp = StudentResponse.model_validate(student)
    if latest_pred:
        s_resp.latest_risk = RiskPredictionBrief.model_validate(latest_pred)
    if latest_fore:
        s_resp.latest_forecast = PerformanceForecastBrief.model_validate(latest_fore)
    s_resp.active_alerts_count = active_alerts
    return s_resp

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student_in: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    update_data = student_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    
    # Re-run prediction if academic indicators changed
    student_dict = {
        "current_gpa": student.current_gpa,
        "cumulative_gpa": student.cumulative_gpa,
        "high_school_gpa": student.high_school_gpa,
        "credit_completion_rate": student.credit_completion_rate,
        "midterm_average": student.midterm_average,
        "course_failure_count": student.course_failure_count,
        "attendance_rate": student.attendance_rate,
        "lms_engagement_score": student.lms_engagement_score,
        "study_hours_per_week": student.study_hours_per_week,
        "first_generation_student": student.first_generation_student,
        "socio_economic_index": student.socio_economic_index,
        "employment_hours_per_week": student.employment_hours_per_week,
        "commute_time_minutes": student.commute_time_minutes
    }
    pred_res = ml_pipeline.predict_student(student_dict)
    
    risk_pred = RiskPrediction(
        student_id=student.id,
        risk_level=pred_res["risk_level"],
        risk_score=pred_res["risk_score"],
        confidence_score=pred_res["confidence_score"],
        top_risk_factors=pred_res["top_risk_factors"],
        positive_factors=pred_res["positive_factors"],
        recommended_actions=pred_res["recommended_actions"],
        model_version=pred_res["model_version"]
    )
    db.add(risk_pred)
    
    perf_forecast = PerformanceForecast(
        student_id=student.id,
        forecast_term="Next Semester (Fall 2026)",
        predicted_gpa=pred_res["predicted_gpa"],
        lower_bound_gpa=pred_res["lower_bound_gpa"],
        upper_bound_gpa=pred_res["upper_bound_gpa"],
        grade_trajectory=pred_res["grade_trajectory"],
        model_version=pred_res["model_version"]
    )
    db.add(perf_forecast)
    db.commit()
    
    s_resp = StudentResponse.model_validate(student)
    s_resp.latest_risk = RiskPredictionBrief.model_validate(risk_pred)
    s_resp.latest_forecast = PerformanceForecastBrief.model_validate(perf_forecast)
    return s_resp
