import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


class Config:
    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)

    SECRET_KEY = os.environ.get("SECRET_KEY", "slbaps-secret-key-2024-change-in-production")
    JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", 24))

    # SQLite database stored in backend/data/
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(DATA_DIR, 'slbaps.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Paths for ML artefacts
    DATASET_PATH = os.path.join(DATA_DIR, "student_learning_dataset.csv")
    OUTCOME_MODEL_PATH = os.path.join(DATA_DIR, "outcome_model.pkl")
    RISK_MODEL_PATH = os.path.join(DATA_DIR, "risk_model.pkl")
    LABEL_ENCODER_PATH = os.path.join(DATA_DIR, "label_encoder.pkl")
    SCALER_PATH = os.path.join(DATA_DIR, "scaler.pkl")
    MODEL_METRICS_PATH = os.path.join(DATA_DIR, "model_metrics.json")
