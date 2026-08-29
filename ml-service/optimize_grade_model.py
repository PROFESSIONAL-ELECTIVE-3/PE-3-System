"""Optimize an interpretable grade forecaster without adding raw inputs.

Ridge is a regularized linear regression model. Polynomial features let the
linear model represent interactions already implicit in the fixed inputs, such
as prior grade × completion rate, while cross-validation controls overfitting.
"""

import json

import joblib
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, median_absolute_error, r2_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, PolynomialFeatures, StandardScaler

from train_models import ARTIFACTS_DIR, FEATURE_COLUMNS, GRADE_TARGET, SCHEDULE_COLUMN, load_data


def build_pipeline() -> Pipeline:
    numeric_columns = [column for column in FEATURE_COLUMNS if column != SCHEDULE_COLUMN]
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("polynomial", PolynomialFeatures(include_bias=False)),
                        ("scaler", StandardScaler()),
                    ]
                ),
                numeric_columns,
            ),
            ("study_schedule", OneHotEncoder(handle_unknown="ignore"), [SCHEDULE_COLUMN]),
        ]
    )
    return Pipeline(steps=[("preprocessor", preprocessor), ("regressor", Ridge())])


def main() -> None:
    data = load_data()
    features = data[FEATURE_COLUMNS].copy()
    target = data[GRADE_TARGET]
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.20, random_state=42
    )

    search = GridSearchCV(
        estimator=build_pipeline(),
        param_grid={
            "preprocessor__numeric__polynomial__degree": [1, 2],
            "regressor__alpha": [0.01, 0.1, 0.3, 1.0, 3.0, 10.0, 30.0, 100.0],
        },
        scoring="neg_mean_absolute_error",
        cv=5,
        n_jobs=-1,
        refit=True,
        verbose=1,
    )
    search.fit(x_train, y_train)

    model = search.best_estimator_
    predictions = model.predict(x_test)
    errors = abs(y_test.to_numpy() - predictions)
    metrics = {
        "fixed_features": FEATURE_COLUMNS,
        "model": "Ridge regression with polynomial feature interactions",
        "selection_metric": "cross-validation MAE",
        "best_cross_validation_mae": -search.best_score_,
        "best_parameters": search.best_params_,
        "held_out_test_mae": mean_absolute_error(y_test, predictions),
        "held_out_test_rmse": mean_squared_error(y_test, predictions) ** 0.5,
        "held_out_test_median_absolute_error": median_absolute_error(y_test, predictions),
        "held_out_test_r2": r2_score(y_test, predictions),
        "held_out_test_within_1_grade_point": float((errors <= 1).mean()),
        "held_out_test_within_2_grade_points": float((errors <= 2).mean()),
    }

    print("Best cross-validation MAE:", round(metrics["best_cross_validation_mae"], 3))
    print("Best parameters:", search.best_params_)
    print("\nHeld-out test evaluation")
    for key in ["held_out_test_mae", "held_out_test_rmse", "held_out_test_median_absolute_error", "held_out_test_r2"]:
        print(f"{key}: {metrics[key]:.3f}")
    print("Within ±1 grade point:", f"{metrics['held_out_test_within_1_grade_point'] * 100:.1f}%")
    print("Within ±2 grade points:", f"{metrics['held_out_test_within_2_grade_points'] * 100:.1f}%")

    # Refit the chosen configuration on all available data for deployment after
    # the holdout evaluation has been completed.
    deployment_model = clone(model)
    deployment_model.fit(features, target)
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    model_path = ARTIFACTS_DIR / "grade_model_optimized.joblib"
    metrics_path = ARTIFACTS_DIR / "grade_model_optimized_metrics.json"
    joblib.dump(deployment_model, model_path)
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Saved optimized grade model to {model_path}")


if __name__ == "__main__":
    main()
