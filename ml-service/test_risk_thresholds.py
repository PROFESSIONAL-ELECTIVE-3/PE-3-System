import unittest

from risk_thresholds import risk_level


class RiskThresholdTests(unittest.TestCase):
    def test_assigns_low_medium_and_high_risk(self):
        self.assertEqual(risk_level(0.19), "low")
        self.assertEqual(risk_level(0.20), "medium")
        self.assertEqual(risk_level(0.39), "medium")
        self.assertEqual(risk_level(0.40), "high")


if __name__ == "__main__":
    unittest.main()
