"""Train the semester-grade and student-outcome models.

Expected data path: data/dataset.csv.  The data must contain the original
Kaggle column names used below.
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import classification_report, mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "dataset.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

# These fields intentionally exclude Course. Kaggle's course codes do not map
# reliably to this university's programs, so using them in a deployed model
# would create an invalid input mapping.
FEATURE_COLUMNS = [
    "Educational special needs",
    "Tuition fees up to date",
    "Scholarship holder",
    "Daytime/evening attendance",
    "Curricular units 1st sem (enrolled)",
    "Curricular units 1st sem (approved)",
    "Semester 1 completion rate",
    "Curricular units 1st sem (grade)",
]

SCHEDULE_COLUMN = "Daytime/evening attendance"
GRADE_TARGET = "Curricular units 2nd sem (grade)"
RISK_TARGET = "Target"


def build_preprocessor() -> ColumnTransformer:
    """Create preprocessing that can also handle unseen schedule values."""
    numeric_columns = [column for column in FEATURE_COLUMNS if column != SCHEDULE_COLUMN]

    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                numeric_columns,
            ),
            (
                "study_schedule",
                OneHotEncoder(handle_unknown="ignore"),
                [SCHEDULE_COLUMN],
            ),
        ]
    )


def load_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. Extract dataset.csv to the data folder first."
        )

    data = pd.read_csv(DATA_PATH)
    required_columns = set(
        [column for column in FEATURE_COLUMNS if column != "Semester 1 completion rate"]
        + [GRADE_TARGET, RISK_TARGET]
    )
    missing_columns = sorted(required_columns - set(data.columns))
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing_columns)}")
    enrolled = data["Curricular units 1st sem (enrolled)"].replace(0, float("nan"))
    data["Semester 1 completion rate"] = (
        data["Curricular units 1st sem (approved)"].div(enrolled).fillna(0).clip(0, 1)
    )
    return data


def train_grade_model(features: pd.DataFrame, target: pd.Series) -> Pipeline:
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.20, random_state=42
    )
    model = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("regressor", LinearRegression()),
        ]
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)

    print("Grade forecast evaluation")
    print(f"  MAE:  {mean_absolute_error(y_test, predictions):.3f}")
    print(f"  RMSE: {root_mean_squared_error(y_test, predictions):.3f}")
    return model


def train_risk_model(features: pd.DataFrame, target: pd.Series) -> Pipeline:
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.20, random_state=42, stratify=target
    )
    model = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)

    print("\nAttrition-risk evaluation")
    print(classification_report(y_test, predictions, digits=3))
    return model


def main() -> None:
    data = load_data()
    features = data[FEATURE_COLUMNS].copy()
    ARTIFACTS_DIR.mkdir(exist_ok=True)

    grade_model = train_grade_model(features, data[GRADE_TARGET])
    risk_model = train_risk_model(features, data[RISK_TARGET])

    joblib.dump(grade_model, ARTIFACTS_DIR / "grade_model.joblib")
    joblib.dump(risk_model, ARTIFACTS_DIR / "risk_model.joblib")
    print(f"\nSaved model artifacts to {ARTIFACTS_DIR}")


if __name__ == "__main__":
    main()
