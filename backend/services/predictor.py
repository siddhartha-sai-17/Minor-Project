"""
predictor.py
------------
Loads the trained ML artefacts and exposes a single predict() function
that accepts raw feature values and returns structured prediction results.
"""

import json
import os

import joblib
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

FEATURES = [
    "daily_study_hours",
    "attendance_percentage",
    "assignment_submission_rate",
    "late_submission_count",
    "revision_frequency_per_week",
    "lms_login_frequency_per_week",
    "lms_time_spent_hours_per_week",
    "video_lectures_watched_per_week",
    "practice_quiz_attempts",
    "class_participation_score",
    "search_skill_score",
    "source_evaluation_score",
    "time_management_score",
    "procrastination_score",
    "stress_level",
]

# ── Module-level singletons (loaded once on first import) ─────────────────────
_outcome_model = None
_risk_model = None
_le_outcome = None
_le_risk = None
_scaler = None
_metrics = None


def _load_artefacts():
    global _outcome_model, _risk_model, _le_outcome, _le_risk, _scaler, _metrics

    required = [
        "outcome_model.pkl",
        "risk_model.pkl",
        "label_encoder_outcome.pkl",
        "label_encoder_risk.pkl",
        "scaler.pkl",
    ]
    for fname in required:
        if not os.path.exists(os.path.join(DATA_DIR, fname)):
            raise FileNotFoundError(
                f"ML artefact '{fname}' not found in {DATA_DIR}. "
                "Run `python backend/services/train_model.py` first."
            )

    _outcome_model = joblib.load(os.path.join(DATA_DIR, "outcome_model.pkl"))
    _risk_model = joblib.load(os.path.join(DATA_DIR, "risk_model.pkl"))
    _le_outcome = joblib.load(os.path.join(DATA_DIR, "label_encoder_outcome.pkl"))
    _le_risk = joblib.load(os.path.join(DATA_DIR, "label_encoder_risk.pkl"))
    _scaler = joblib.load(os.path.join(DATA_DIR, "scaler.pkl"))

    metrics_path = os.path.join(DATA_DIR, "model_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            _metrics = json.load(f)


def predict(input_data: dict) -> dict:
    """
    Run ML prediction on a single student record.

    Parameters
    ----------
    input_data : dict
        Keys must match FEATURES list.

    Returns
    -------
    dict with keys:
        predicted_learning_outcome, predicted_risk_level,
        confidence_score, feature_importance
    """
    global _outcome_model, _risk_model, _le_outcome, _le_risk, _scaler

    if _outcome_model is None:
        _load_artefacts()

    # Build feature vector in correct order
    x = np.array([[input_data[f] for f in FEATURES]], dtype=float)
    x_scaled = _scaler.transform(x)

    # Outcome prediction
    outcome_enc = _outcome_model.predict(x_scaled)[0]
    predicted_outcome = _le_outcome.inverse_transform([outcome_enc])[0]

    # Confidence (probability of predicted class)
    confidence = None
    if hasattr(_outcome_model, "predict_proba"):
        proba = _outcome_model.predict_proba(x_scaled)[0]
        confidence = round(float(proba[outcome_enc]), 4)

    # Risk prediction
    risk_enc = _risk_model.predict(x_scaled)[0]
    predicted_risk = _le_risk.inverse_transform([risk_enc])[0]

    # Feature importance from stored metrics
    feat_importance = {}
    if _metrics and _metrics.get("feature_importance"):
        feat_importance = _metrics["feature_importance"]

    return {
        "predicted_learning_outcome": predicted_outcome,
        "predicted_risk_level": predicted_risk,
        "confidence_score": confidence,
        "feature_importance": feat_importance,
    }


def get_model_metrics() -> dict:
    """Return stored model metrics (used by admin/info endpoints)."""
    if _metrics is None:
        _load_artefacts()
    return _metrics or {}
