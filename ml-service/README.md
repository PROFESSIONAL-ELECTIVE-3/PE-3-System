# ML training service

This training setup intentionally uses only fields compatible with the planned
student form. It excludes `Course`, because the Kaggle course codes do not
have a validated mapping to this university's courses.

## Current model inputs

- Educational special needs
- Tuition-fee status
- Scholarship holder
- Semester-1 units enrolled
- Semester-1 units approved
- Semester-1 completion rate (`units approved / units enrolled`)
- Semester-1 average grade
- Daytime/evening study schedule

The dataset's `Daytime/evening attendance` column represents study schedule,
not an attendance percentage. Keep this label distinct from a future real
attendance-rate field.

## Targets

- **Grade model:** Semester-1 information predicts `Curricular units 2nd sem (grade)`.
- **Risk model:** Semester-1 information predicts `Dropout`, `Enrolled`, or `Graduate`.

## Train locally

1. Place `dataset.csv` in `data/dataset.csv`.
2. Install Python 3.10 or later.
3. In this directory, run:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   py train_models.py
   ```

The command creates `artifacts/grade_model.joblib` and
`artifacts/risk_model.joblib`. These artifacts will be loaded by the prediction
API in the next integration step.

For the broader multi-metric optimization used for the deployable model, run:

```powershell
.\.venv312\Scripts\python.exe optimize_risk_model_max.py
```

To optimize the grade forecaster while keeping it a regularized linear model,
run:

```powershell
.\.venv312\Scripts\python.exe optimize_grade_model.py
```

## Flexible grading scales

The trained grade model uses the Kaggle dataset's `0–20` scale internally. The
prediction API should accept both `previousSemesterGrade` and
`gradeMaximum`, then convert only the grade value:

```text
Previous grade: 75 / 100 → model input: 15 / 20
Model result: 14 / 20     → displayed prediction: 70 / 100
```

The same conversion supports 4.0, 5.0, 20, 100, or another numeric scale.
`grading_scale.py` contains the conversion helpers and bounds the displayed
prediction to `0–gradeMaximum`.

## Run the prediction API

After installing the requirements and generating the optimized artifacts,
start FastAPI from this folder:

```powershell
.\.venv312\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

The Express backend forwards authenticated `POST /api/ml/predict` requests to
this service. Its default `ML_SERVICE_URL` is `http://localhost:8000`; set
`ML_SERVICE_URL` in the backend environment only when the service runs on a
different host or port.
