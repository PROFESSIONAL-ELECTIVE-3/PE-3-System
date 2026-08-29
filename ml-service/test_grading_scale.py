import unittest

from grading_scale import from_model_scale, to_model_scale


class GradeScaleTests(unittest.TestCase):
    def test_percentage_scale_converts_to_model_scale(self):
        self.assertEqual(to_model_scale(75, 100), 15.0)

    def test_four_point_scale_converts_to_model_scale(self):
        self.assertEqual(to_model_scale(3, 4), 15.0)

    def test_model_output_converts_back_to_selected_scale(self):
        self.assertEqual(from_model_scale(15, 100), 75.0)
        self.assertEqual(from_model_scale(15, 4), 3.0)

    def test_output_is_bounded_to_selected_scale(self):
        self.assertEqual(from_model_scale(22, 100), 100.0)
        self.assertEqual(from_model_scale(-1, 4), 0.0)


if __name__ == "__main__":
    unittest.main()
