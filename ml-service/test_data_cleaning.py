import unittest

import pandas as pd

from train_models import GRADE_TARGET, RISK_TARGET, clean_data


def valid_row(**overrides):
    row = {
        RISK_TARGET: "Dropout",
        "Curricular units 1st sem (enrolled)": 6,
        "Curricular units 1st sem (approved)": 4,
        "Curricular units 1st sem (grade)": 12.5,
        GRADE_TARGET: 13.0,
    }
    row.update(overrides)
    return row


class DataCleaningTests(unittest.TestCase):
    def test_normalizes_labels_and_removes_exact_duplicates(self):
        data = pd.DataFrame(
            [
                valid_row(**{RISK_TARGET: " dropout "}),
                valid_row(**{RISK_TARGET: " dropout "}),
                valid_row(**{RISK_TARGET: "GRADUATE"}),
            ]
        )

        cleaned = clean_data(data)

        self.assertEqual(cleaned[RISK_TARGET].tolist(), ["Dropout", "Graduate"])

    def test_removes_unknown_labels_and_impossible_academic_values(self):
        data = pd.DataFrame(
            [
                valid_row(),
                valid_row(**{RISK_TARGET: "transferred"}),
                valid_row(**{"Curricular units 1st sem (enrolled)": 0}),
                valid_row(**{"Curricular units 1st sem (approved)": 7}),
                valid_row(**{"Curricular units 1st sem (grade)": 21}),
                valid_row(**{GRADE_TARGET: -1}),
            ]
        )

        cleaned = clean_data(data)

        self.assertEqual(len(cleaned), 1)
        self.assertEqual(cleaned.iloc[0][RISK_TARGET], "Dropout")


if __name__ == "__main__":
    unittest.main()
