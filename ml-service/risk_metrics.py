"""Evaluation metrics for the attrition classifier and its risk tiers."""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    brier_score_loss,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from risk_thresholds import risk_level


def evaluate_risk_model(model, features: pd.DataFrame, target: pd.Series) -> dict[str, object]:
    """Evaluate predicted outcomes and calibrated dropout-risk probabilities.

    The three-class metrics assess target prediction. Binary probability metrics
    assess the operational question: which students later dropped out?
    """
    predictions = model.predict(features)
    probabilities = np.asarray(model.predict_proba(features), dtype=float)
    class_names = [str(label) for label in model.classes_]
    if "Dropout" not in class_names:
        raise ValueError("Risk model must contain a 'Dropout' outcome class.")

    dropout_index = class_names.index("Dropout")
    dropout_probability = probabilities[:, dropout_index]
    actual_dropout = target.astype("string").eq("Dropout")
    predicted_dropout = pd.Series(predictions, index=target.index).astype("string").eq("Dropout")
    binary_confusion_matrix = confusion_matrix(
        actual_dropout, predicted_dropout, labels=[False, True]
    )
    true_negative, false_positive, false_negative, true_positive = (
        int(value) for value in binary_confusion_matrix.ravel()
    )
    tiers = pd.Series(dropout_probability, index=target.index).map(risk_level)
    tier_summary = []
    for tier in ("high", "medium", "low"):
        tier_mask = tiers.eq(tier)
        tier_count = int(tier_mask.sum())
        tier_dropouts = int(actual_dropout.loc[tier_mask].sum())
        tier_summary.append(
            {
                "tier": tier,
                "student_count": tier_count,
                "actual_dropout_count": tier_dropouts,
                "observed_dropout_rate": (
                    float(tier_dropouts / tier_count) if tier_count else None
                ),
            }
        )

    return {
        "accuracy": float(accuracy_score(target, predictions)),
        "balanced_accuracy": float(balanced_accuracy_score(target, predictions)),
        "macro_f1": float(f1_score(target, predictions, average="macro", zero_division=0)),
        "weighted_f1": float(f1_score(target, predictions, average="weighted", zero_division=0)),
        "dropout_precision": float(
            precision_score(actual_dropout, predicted_dropout, zero_division=0)
        ),
        "dropout_recall": float(
            recall_score(actual_dropout, predicted_dropout, zero_division=0)
        ),
        "dropout_f1": float(
            f1_score(actual_dropout, predicted_dropout, zero_division=0)
        ),
        "dropout_binary_accuracy": float(accuracy_score(actual_dropout, predicted_dropout)),
        "dropout_specificity": float(
            true_negative / (true_negative + false_positive)
            if true_negative + false_positive
            else 0.0
        ),
        "dropout_confusion_matrix": [
            [true_negative, false_positive],
            [false_negative, true_positive],
        ],
        "dropout_roc_auc": float(roc_auc_score(actual_dropout, dropout_probability)),
        "dropout_average_precision": float(
            average_precision_score(actual_dropout, dropout_probability)
        ),
        "dropout_brier_score": float(brier_score_loss(actual_dropout, dropout_probability)),
        "risk_tier_evaluation": tier_summary,
        "report": classification_report(target, predictions, digits=3, output_dict=True),
    }
