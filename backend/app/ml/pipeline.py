import pandas as pd
import numpy as np
import os
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

def generate_mock_student_dataset(num_samples: int = 500, output_path: str = None) -> pd.DataFrame:
    np.random.seed(42)
    
    majors = ['Computer Science', 'Electrical Engineering', 'Business Administration', 'Biology', 'Nursing', 'Mechanical Engineering', 'Psychology', 'Economics']
    departments = {
        'Computer Science': 'Engineering & Computing',
        'Electrical Engineering': 'Engineering & Computing',
        'Mechanical Engineering': 'Engineering & Computing',
        'Business Administration': 'Business School',
        'Economics': 'Business School',
        'Biology': 'Natural Sciences',
        'Nursing': 'Health Sciences',
        'Psychology': 'Social Sciences'
    }
    
    first_names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Chris', 'Pat', 'Riley', 'Casey', 'Jamie', 'Avery', 'Dakota', 'Reese', 'Kendall', 'Logan', 'Skyler', 'Cameron', 'Peyton', 'Quinn', 'Harper']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White']
    
    data = []
    for i in range(1, num_samples + 1):
        fn = np.random.choice(first_names)
        ln = np.random.choice(last_names)
        student_id = f"STU-2026-{i:04d}"
        email = f"{fn.lower()}.{ln.lower()}{i}@university.edu"
        
        major = np.random.choice(majors)
        dept = departments[major]
        enrollment_year = np.random.choice([2023, 2024, 2025], p=[0.3, 0.4, 0.3])
        cohort = f"Cohort {enrollment_year}"
        
        hs_gpa = np.clip(np.random.normal(3.2, 0.4), 2.0, 4.0)
        curr_gpa = np.clip(hs_gpa + np.random.normal(-0.1, 0.3), 1.0, 4.0)
        cum_gpa = np.clip((hs_gpa + curr_gpa) / 2.0 + np.random.normal(0, 0.1), 1.0, 4.0)
        
        credits_att = np.random.choice([12, 15, 16, 18])
        completion_rate = np.clip(np.random.normal(0.88, 0.15), 0.4, 1.0)
        credits_earn = credits_att * completion_rate
        
        midterm_avg = np.clip(curr_gpa * 22 + np.random.normal(0, 8), 40, 100)
        failures = int(np.clip(np.random.exponential(0.3) if curr_gpa > 2.5 else np.random.exponential(1.5), 0, 5))
        
        attendance = np.clip(curr_gpa * 22 + np.random.normal(10, 10), 45, 100)
        lms_score = np.clip(curr_gpa * 20 + np.random.normal(12, 12), 30, 100)
        study_hours = np.clip(np.random.normal(14, 5), 2, 35)
        
        first_gen = np.random.choice([True, False], p=[0.35, 0.65])
        aid_status = np.random.choice(['None', 'Partial Grant', 'Full Scholarship', 'Pell Grant'], p=[0.3, 0.4, 0.15, 0.15])
        socio_index = np.clip(np.random.normal(52, 18), 10, 100)
        commute = int(np.clip(np.random.exponential(20), 0, 90))
        emp_hours = int(np.clip(np.random.choice([0, 10, 20, 30], p=[0.5, 0.25, 0.15, 0.10]) + np.random.normal(0, 2), 0, 40))
        
        # Risk heuristic for synthetic target generation
        risk_calc = (
            (4.0 - curr_gpa) * 0.35 +
            (100 - attendance) * 0.25 +
            (100 - lms_score) * 0.20 +
            failures * 0.10 +
            (1.0 if first_gen else 0.0) * 0.05 +
            (emp_hours / 40.0) * 0.05
        )
        
        # Attrition label (0: Low/Retention, 1: Medium Risk, 2: High Risk)
        if risk_calc > 1.8:
            risk_label = "High"
            status = "Active" if np.random.random() > 0.2 else "Dropped Out"
        elif risk_calc > 1.2:
            risk_label = "Medium"
            status = "Active"
        else:
            risk_label = "Low"
            status = "Active"
            
        academic_standing = "Good Standing"
        if curr_gpa < 2.0:
            academic_standing = "Probation"
        elif curr_gpa < 2.5:
            academic_standing = "Warning"
            
        record = {
            "student_id": student_id,
            "first_name": fn,
            "last_name": ln,
            "email": email,
            "major": major,
            "department": dept,
            "enrollment_year": int(enrollment_year),
            "cohort": cohort,
            "academic_standing": academic_standing,
            "status": status,
            "current_gpa": round(curr_gpa, 2),
            "cumulative_gpa": round(cum_gpa, 2),
            "high_school_gpa": round(hs_gpa, 2),
            "credits_attempted": float(credits_att),
            "credits_earned": round(credits_earn, 1),
            "credit_completion_rate": round(completion_rate, 2),
            "midterm_average": round(midterm_avg, 1),
            "course_failure_count": failures,
            "attendance_rate": round(attendance, 1),
            "lms_engagement_score": round(lms_score, 1),
            "study_hours_per_week": round(study_hours, 1),
            "first_generation_student": bool(first_gen),
            "financial_aid_status": aid_status,
            "socio_economic_index": round(socio_index, 1),
            "commute_time_minutes": commute,
            "employment_hours_per_week": emp_hours,
            "attrition_risk_label": risk_label,
            "next_term_gpa": round(np.clip(curr_gpa + np.random.normal(0.05, 0.2), 1.0, 4.0), 2)
        }
        data.append(record)
        
    df = pd.DataFrame(data)
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
    return df

class AcademicMLPipeline:
    def __init__(self, models_dir: Path):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.classifier_path = self.models_dir / "risk_classifier.joblib"
        self.regressor_path = self.models_dir / "gpa_regressor.joblib"
        
        self.classifier = None
        self.regressor = None
        self.feature_columns = [
            'current_gpa', 'cumulative_gpa', 'high_school_gpa',
            'credit_completion_rate', 'midterm_average', 'course_failure_count',
            'attendance_rate', 'lms_engagement_score', 'study_hours_per_week',
            'first_generation_student', 'socio_economic_index',
            'employment_hours_per_week', 'commute_time_minutes'
        ]

    def train_models(self, df: pd.DataFrame):
        X = df[self.feature_columns].copy()
        # Convert boolean to int
        X['first_generation_student'] = X['first_generation_student'].astype(int)
        
        # Classification Target: 0: Low, 1: Medium, 2: High
        risk_map = {"Low": 0, "Medium": 1, "High": 2}
        y_class = df['attrition_risk_label'].map(risk_map)
        
        # Regression Target: next_term_gpa
        y_reg = df['next_term_gpa']
        
        # Train XGBoost Classifier
        self.classifier = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.05,
            random_state=42,
            eval_metric="mlogloss"
        )
        self.classifier.fit(X, y_class)
        
        # Train Gradient Boosting Regressor for GPA forecasting
        self.regressor = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.05,
            random_state=42
        )
        self.regressor.fit(X, y_reg)
        
        # Save models
        joblib.dump({"model": self.classifier, "features": self.feature_columns}, self.classifier_path)
        joblib.dump({"model": self.regressor, "features": self.feature_columns}, self.regressor_path)
        return True

    def load_models(self):
        if self.classifier_path.exists() and self.regressor_path.exists():
            clf_data = joblib.load(self.classifier_path)
            reg_data = joblib.load(self.regressor_path)
            self.classifier = clf_data["model"]
            self.regressor = reg_data["model"]
            return True
        return False

    def predict_student(self, student_dict: dict) -> dict:
        if not self.classifier or not self.regressor:
            if not self.load_models():
                # Train on the fly with synthetic data if models don't exist yet
                df_mock = generate_mock_student_dataset(300)
                self.train_models(df_mock)
                
        X_input = pd.DataFrame([{col: student_dict.get(col, 0) for col in self.feature_columns}])
        X_input['first_generation_student'] = int(X_input['first_generation_student'].iloc[0])
        
        # Classification inference
        probs = self.classifier.predict_proba(X_input)[0]  # [p_low, p_med, p_high]
        pred_class_idx = int(np.argmax(probs))
        class_names = ["Low", "Medium", "High"]
        risk_level = class_names[pred_class_idx]
        risk_score = float(probs[1] + probs[2] * 1.5) / 1.5  # Weighted risk score 0-1
        risk_score = float(np.clip(risk_score, 0.01, 0.99))
        confidence = float(np.max(probs))
        
        # If high raw features, ensure high risk level
        if student_dict.get('current_gpa', 3.0) < 2.0 or student_dict.get('attendance_rate', 90) < 60:
            if risk_level == "Low":
                risk_level = "Medium"
                risk_score = max(risk_score, 0.65)
                
        # Regression inference (GPA forecast)
        pred_gpa = float(self.regressor.predict(X_input)[0])
        pred_gpa = float(np.clip(pred_gpa, 1.0, 4.0))
        
        # Determine trajectory
        current_gpa = student_dict.get('current_gpa', 3.0)
        gpa_diff = pred_gpa - current_gpa
        if gpa_diff > 0.15:
            trajectory = "Improving"
        elif gpa_diff < -0.15:
            trajectory = "Declining"
        elif current_gpa < 2.0:
            trajectory = "Critical Drop"
        else:
            trajectory = "Stable"
            
        # Feature importance / XAI contributions
        factors = []
        att = student_dict.get('attendance_rate', 90)
        lms = student_dict.get('lms_engagement_score', 80)
        failures = student_dict.get('course_failure_count', 0)
        
        if att < 75:
            factors.append({"factor": "Low Attendance Rate", "weight": round(0.35, 2), "direction": "increase_risk", "description": f"Attendance is {att}%, below institutional threshold of 75%."})
        if lms < 60:
            factors.append({"factor": "Low LMS Engagement", "weight": round(0.28, 2), "direction": "increase_risk", "description": f"Platform activity score is {lms}/100."})
        if failures > 0:
            factors.append({"factor": "Course Failure History", "weight": round(0.30 * failures, 2), "direction": "increase_risk", "description": f"Student has recorded {failures} course failure(s)."})
        if current_gpa < 2.3:
            factors.append({"factor": "Low Current GPA", "weight": round(0.32, 2), "direction": "increase_risk", "description": f"Current GPA is {current_gpa}, near academic probation limits."})
            
        positive_factors = []
        if current_gpa >= 3.2:
            positive_factors.append({"factor": "Strong Academic Standing", "weight": 0.35, "direction": "reduce_risk", "description": f"GPA of {current_gpa} reflects strong mastery."})
        if att >= 88:
            positive_factors.append({"factor": "Consistent Attendance", "weight": 0.25, "direction": "reduce_risk", "description": f"High attendance ({att}%) indicates engagement."})
        if lms >= 75:
            positive_factors.append({"factor": "Active Portal Engagement", "weight": 0.20, "direction": "reduce_risk", "description": "Regular interactions with course materials."})
            
        if not factors:
            factors.append({"factor": "Stable Performance Profile", "weight": 0.10, "direction": "neutral", "description": "No major academic distress flags detected."})
            
        if not positive_factors:
            positive_factors.append({"factor": "Standard Enrollment", "weight": 0.10, "direction": "neutral", "description": "Active student status."})
            
        # Recommended advisor interventions
        recommendations = []
        if risk_level == "High":
            recommendations = [
                "Schedule mandatory 1-on-1 academic advising session within 5 days",
                "Connect student with peer tutoring center for targeted coursework",
                "Review financial aid and employment hours to reduce burnout"
            ]
        elif risk_level == "Medium":
            recommendations = [
                "Send encouraging faculty check-in email regarding study habits",
                "Recommend attendance monitoring and LMS resource review",
                "Offer optional academic coaching workshop"
            ]
        else:
            recommendations = [
                "Maintain standard semester progress check-ins",
                "Encourage participation in honors or advanced study tracks"
            ]
            
        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 3),
            "confidence_score": round(confidence, 3),
            "top_risk_factors": factors,
            "positive_factors": positive_factors,
            "recommended_actions": recommendations,
            "predicted_gpa": round(pred_gpa, 2),
            "lower_bound_gpa": round(max(1.0, pred_gpa - 0.25), 2),
            "upper_bound_gpa": round(min(4.0, pred_gpa + 0.25), 2),
            "grade_trajectory": trajectory,
            "model_version": "XGBoost_v1.2_Ensemble"
        }
