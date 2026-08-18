from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.etl import ETLPipelineService
from app.ml.pipeline import generate_mock_student_dataset
import os

router = APIRouter(prefix="/etl", tags=["Data Ingestion & ETL Studio"])

@router.post("/upload-csv")
async def upload_csv_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    etl = ETLPipelineService(db)
    result = etl.process_csv_upload(contents)
    return result

@router.post("/seed-mock-data")
def seed_mock_data(num_samples: int = 150, db: Session = Depends(get_db)):
    df = generate_mock_student_dataset(num_samples=num_samples)
    csv_bytes = df.to_csv(index=False).encode('utf-8')
    etl = ETLPipelineService(db)
    result = etl.process_csv_upload(csv_bytes)
    return {
        "success": True,
        "message": f"Successfully seeded {result['total_processed']} student records with ML risk scores and performance forecasts.",
        **result
    }
