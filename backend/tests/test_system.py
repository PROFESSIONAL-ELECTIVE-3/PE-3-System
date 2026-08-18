import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.ml.pipeline import generate_mock_student_dataset, AcademicMLPipeline
from app.config import settings

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_academic_attrition.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"

def test_ml_pipeline_generation():
    df = generate_mock_student_dataset(num_samples=50)
    assert len(df) == 50
    assert "current_gpa" in df.columns
    assert "attrition_risk_label" in df.columns

def test_etl_seed_endpoint():
    response = client.post("/api/v1/etl/seed-mock-data?num_samples=20")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_processed"] == 20

def test_students_listing():
    response = client.get("/api/v1/students")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_dashboard_analytics():
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "risk_distribution" in data
    assert "average_gpa" in data
