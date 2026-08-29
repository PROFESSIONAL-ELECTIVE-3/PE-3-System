"""Broad, multi-metric Random Forest optimization using the fixed input set.

The 20% test set is never used during cross-validation parameter selection.
After evaluation, the selected configuration is refit on all rows for the
deployable artifact.
"""

import json
from pathlib import Path

import joblib
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score, make_scorer
from sklearn.model_selection import RandomizedSearchCV, train_test_split
from sklearn.pipeline import Pipeline

from train_models import ARTIFACTS_DIR, FEATURE_COLUMNS, RISK_TARGET, build_preprocessor, load_data


SEARCH_ITERATIONS = 80
RANDOM_SEED = 42


def main() -> None:
    data = load_data()
    features = data[FEATURE_COLUMNS].copy()
    target = data[RISK_TARGET]
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.20, random_state=RANDOM_SEED, stratify=target
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("classifier", RandomForestClassifier(random_state=RANDOM_SEED, n_jobs=-1)),
        ]
    )
    dropout_f1 = make_scorer(f1_score, labels=["Dropout"], average="macro")
    scores = {
        "accuracy": "accuracy",
        "balanced_accuracy": "balanced_accuracy",
        "weighted_f1": "f1_weighted",
        "dropout_f1": dropout_f1,
    }

    search = RandomizedSearchCV(
        estimator=pipeline,
        param_distributions={
            "classifier__n_estimators": [400, 600, 800, 1000, 1400],
            "classifier__criterion": ["gini", "entropy", "log_loss"],
            "classifier__max_depth": [None, 10, 14, 18, 24, 30, 40],
            "classifier__min_samples_split": [2, 4, 6, 10, 14, 20],
            "classifier__min_samples_leaf": [1, 2, 3, 4, 6, 8, 12],
            "classifier__max_features": ["sqrt", "log2", 0.4, 0.6, 0.8, 1.0],
            "classifier__class_weight": [None, "balanced", "balanced_subsample"],
            "classifier__bootstrap": [True],
            "classifier__max_samples": [None, 0.7, 0.85],
        },
        n_iter=SEARCH_ITERATIONS,
        scoring=scores,
        refit="weighted_f1",
        cv=5,
        random_state=RANDOM_SEED,
        n_jobs=-1,
        verbose=1,
    )
    search.fit(x_train, y_train)

    best_validation_model = search.best_estimator_
    test_predictions = best_validation_model.predict(x_test)
    test_report = classification_report(y_test, test_predictions, digits=3, output_dict=True)
    summary = {
        "fixed_features": FEATURE_COLUMNS,
        "selection_metric": "weighted_f1",
        "best_cross_validation_weighted_f1": search.best_score_,
        "best_parameters": search.best_params_,
        "held_out_test_accuracy": accuracy_score(y_test, test_predictions),
        "held_out_test_report": test_report,
    }

    print("Best cross-validation weighted F1:", round(search.best_score_, 3))
    print("Best parameters:", search.best_params_)
    print("\nHeld-out test-set evaluation")
    print(classification_report(y_test, test_predictions, digits=3))

    # Refit only the chosen setup, now using all known student rows, for use
    # by the prediction API. The printed test metrics remain unbiased because
    # this refit happens only after evaluation.
    deployment_model = clone(best_validation_model)
    deployment_model.fit(features, target)
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    artifact_path = ARTIFACTS_DIR / "risk_model_optimized.joblib"
    metadata_path = ARTIFACTS_DIR / "risk_model_optimized_metrics.json"
    joblib.dump(deployment_model, artifact_path)
    metadata_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Saved deployment model to {artifact_path}")
    print(f"Saved evaluation metadata to {metadata_path}")


if __name__ == "__main__":
    main()
