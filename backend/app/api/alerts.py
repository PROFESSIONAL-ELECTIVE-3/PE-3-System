from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.alert import EarlyWarningAlert, InterventionRecord
from app.models.student import Student
from app.schemas.alert import EarlyWarningAlertResponse, EarlyWarningAlertResolve, InterventionCreate, InterventionUpdate, InterventionResponse

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts & Interventions"])

@router.get("", response_model=List[EarlyWarningAlertResponse])
def get_alerts(resolved: bool = None, db: Session = Depends(get_db)):
    query = db.query(EarlyWarningAlert)
    if resolved is not None:
        query = query.filter(EarlyWarningAlert.is_resolved == resolved)
    alerts = query.order_by(EarlyWarningAlert.created_at.desc()).all()
    
    response = []
    for a in alerts:
        student = db.query(Student).filter(Student.id == a.student_id).first()
        a_resp = EarlyWarningAlertResponse.model_validate(a)
        if student:
            a_resp.student_name = f"{student.first_name} {student.last_name}"
            a_resp.student_identifier = student.student_id
            a_resp.major = student.major
        response.append(a_resp)
    return response

@router.put("/{alert_id}/resolve", response_model=EarlyWarningAlertResponse)
def resolve_alert(alert_id: int, resolve_in: EarlyWarningAlertResolve, db: Session = Depends(get_db)):
    alert = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.is_resolved = True
    alert.resolution_notes = resolve_in.resolution_notes
    alert.resolved_by = "Academic Advisor"
    db.commit()
    db.refresh(alert)
    
    student = db.query(Student).filter(Student.id == alert.student_id).first()
    a_resp = EarlyWarningAlertResponse.model_validate(alert)
    if student:
        a_resp.student_name = f"{student.first_name} {student.last_name}"
        a_resp.student_identifier = student.student_id
        a_resp.major = student.major
    return a_resp

@router.get("/interventions", response_model=List[InterventionResponse])
def get_interventions(db: Session = Depends(get_db)):
    interventions = db.query(InterventionRecord).order_by(InterventionRecord.created_at.desc()).all()
    response = []
    for intr in interventions:
        student = db.query(Student).filter(Student.id == intr.student_id).first()
        i_resp = InterventionResponse.model_validate(intr)
        if student:
            i_resp.student_name = f"{student.first_name} {student.last_name}"
            i_resp.student_identifier = student.student_id
        response.append(i_resp)
    return response

@router.post("/interventions", response_model=InterventionResponse, status_code=201)
def create_intervention(intervention_in: InterventionCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == intervention_in.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    intr = InterventionRecord(
        student_id=intervention_in.student_id,
        advisor_name="Lead Academic Advisor",
        title=intervention_in.title,
        intervention_type=intervention_in.intervention_type,
        priority=intervention_in.priority,
        notes=intervention_in.notes,
        action_plan=intervention_in.action_plan,
        scheduled_date=intervention_in.scheduled_date,
        follow_up_date=intervention_in.follow_up_date
    )
    db.add(intr)
    db.commit()
    db.refresh(intr)
    
    i_resp = InterventionResponse.model_validate(intr)
    i_resp.student_name = f"{student.first_name} {student.last_name}"
    i_resp.student_identifier = student.student_id
    return i_resp

@router.put("/interventions/{intervention_id}", response_model=InterventionResponse)
def update_intervention(intervention_id: int, intervention_in: InterventionUpdate, db: Session = Depends(get_db)):
    intr = db.query(InterventionRecord).filter(InterventionRecord.id == intervention_id).first()
    if not intr:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    update_data = intervention_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(intr, key, val)
    db.commit()
    db.refresh(intr)
    
    student = db.query(Student).filter(Student.id == intr.student_id).first()
    i_resp = InterventionResponse.model_validate(intr)
    if student:
        i_resp.student_name = f"{student.first_name} {student.last_name}"
        i_resp.student_identifier = student.student_id
    return i_resp
