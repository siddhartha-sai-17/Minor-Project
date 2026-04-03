"""
SQLAlchemy ORM models for SLBAPS (Student Learning Behavior Analysis & Prediction System).
"""
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """Registered application users."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship – one user → many analyses
    analyses = db.relationship("StudentAnalysis", back_populates="user", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class StudentAnalysis(db.Model):
    """Stores every prediction request + result for a logged-in user."""
    __tablename__ = "student_analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # ── Input features ──────────────────────────────────────────────────────
    daily_study_hours = db.Column(db.Float, nullable=False)
    attendance_percentage = db.Column(db.Float, nullable=False)
    assignment_submission_rate = db.Column(db.Float, nullable=False)
    late_submission_count = db.Column(db.Integer, nullable=False)
    revision_frequency_per_week = db.Column(db.Float, nullable=False)
    lms_login_frequency_per_week = db.Column(db.Float, nullable=False)
    lms_time_spent_hours_per_week = db.Column(db.Float, nullable=False)
    video_lectures_watched_per_week = db.Column(db.Float, nullable=False)
    practice_quiz_attempts = db.Column(db.Integer, nullable=False)
    class_participation_score = db.Column(db.Float, nullable=False)
    search_skill_score = db.Column(db.Float, nullable=False)
    source_evaluation_score = db.Column(db.Float, nullable=False)
    time_management_score = db.Column(db.Float, nullable=False)
    procrastination_score = db.Column(db.Float, nullable=False)
    stress_level = db.Column(db.Float, nullable=False)

    # ── ML outputs ───────────────────────────────────────────────────────────
    predicted_learning_outcome = db.Column(db.String(50), nullable=False)
    predicted_risk_level = db.Column(db.String(50), nullable=False)
    confidence_score = db.Column(db.Float, nullable=True)

    # ── Generated text outputs ───────────────────────────────────────────────
    analysis_summary = db.Column(db.Text, nullable=True)     # JSON array stored as text
    recommendations = db.Column(db.Text, nullable=True)      # JSON array stored as text

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Back-reference
    user = db.relationship("User", back_populates="analyses")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "user_id": self.user_id,
            # inputs
            "daily_study_hours": self.daily_study_hours,
            "attendance_percentage": self.attendance_percentage,
            "assignment_submission_rate": self.assignment_submission_rate,
            "late_submission_count": self.late_submission_count,
            "revision_frequency_per_week": self.revision_frequency_per_week,
            "lms_login_frequency_per_week": self.lms_login_frequency_per_week,
            "lms_time_spent_hours_per_week": self.lms_time_spent_hours_per_week,
            "video_lectures_watched_per_week": self.video_lectures_watched_per_week,
            "practice_quiz_attempts": self.practice_quiz_attempts,
            "class_participation_score": self.class_participation_score,
            "search_skill_score": self.search_skill_score,
            "source_evaluation_score": self.source_evaluation_score,
            "time_management_score": self.time_management_score,
            "procrastination_score": self.procrastination_score,
            "stress_level": self.stress_level,
            # outputs
            "predicted_learning_outcome": self.predicted_learning_outcome,
            "predicted_risk_level": self.predicted_risk_level,
            "confidence_score": self.confidence_score,
            "analysis_summary": json.loads(self.analysis_summary) if self.analysis_summary else [],
            "recommendations": json.loads(self.recommendations) if self.recommendations else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
