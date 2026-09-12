import unittest

import pandas as pd

from risk_metrics import evaluate_risk_model


class FixedRiskModel:
    classes_ = ["Dropout", "Enrolled", "Graduate"]

    def predict(self, features):
        return ["Dropout", "Enrolled", "Graduate"]

    def predict_proba(self, features):
        return [
            [0.80, 0.10, 0.10],
            [0.25, 0.65, 0.10],
            [0.05, 0.10, 0.85],
        ]


class RiskMetricsTests(unittest.TestCase):
    def test_evaluates_outcomes_and_observed_risk_tiers(self):
        features = pd.DataFrame({"example": [1, 2, 3]})
        target = pd.Series(["Dropout", "Enrolled", "Graduate"])

        metrics = evaluate_risk_model(FixedRiskModel(), features, target)

        self.assertEqual(metrics["accuracy"], 1.0)
        self.assertEqual(metrics["balanced_accuracy"], 1.0)
        self.assertEqual(metrics["dropout_binary_accuracy"], 1.0)
        self.assertEqual(metrics["dropout_confusion_matrix"], [[2, 0], [0, 1]])
        self.assertEqual(metrics["dropout_roc_auc"], 1.0)
        self.assertEqual(metrics["risk_tier_evaluation"][0]["tier"], "high")
        self.assertEqual(metrics["risk_tier_evaluation"][0]["observed_dropout_rate"], 1.0)


if __name__ == "__main__":
    unittest.main()
