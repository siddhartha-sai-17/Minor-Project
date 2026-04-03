"""
train_model.py
--------------
Trains multiple classification models on the synthetic student dataset,
compares performance, selects the best model, and persists artefacts.

Run:
    python backend/services/train_model.py
"""

import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Allow running from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

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

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    print(f"[train_model] Loaded {len(df):,} rows from {csv_path}")
    return df


def build_models() -> dict:
    return {
        "LogisticRegression": LogisticRegression(
            max_iter=1000, solver="lbfgs", random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=200, max_depth=15, random_state=42, n_jobs=-1
        ),
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=200, learning_rate=0.1, max_depth=5, random_state=42
        ),
    }


def evaluate(model, X_test, y_test, label: str) -> dict:
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    print(f"\n{'─'*50}")
    print(f"  {label}")
    print(f"  Accuracy : {acc:.4f}  |  Precision: {prec:.4f}"
          f"  |  Recall: {rec:.4f}  |  F1: {f1:.4f}")
    print(classification_report(y_test, y_pred, zero_division=0))
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1}


def train_and_save():
    os.makedirs(DATA_DIR, exist_ok=True)
    csv_path = os.path.join(DATA_DIR, "student_learning_dataset.csv")

    # ── Generate dataset if not present ────────────────────────────────────────
    if not os.path.exists(csv_path):
        print("[train_model] Dataset not found – generating …")
        from backend.services.dataset_generator import generate_dataset, save_dataset
        df = generate_dataset()
        save_dataset(df, csv_path)
    else:
        df = load_data(csv_path)

    X = df[FEATURES]
    y_outcome = df["learning_outcome"]
    y_risk = df["risk_level"]

    # ── Encode labels ──────────────────────────────────────────────────────────
    le_outcome = LabelEncoder()
    le_risk = LabelEncoder()
    y_outcome_enc = le_outcome.fit_transform(y_outcome)
    y_risk_enc = le_risk.fit_transform(y_risk)

    print(f"[train_model] Outcome classes : {list(le_outcome.classes_)}")
    print(f"[train_model] Risk classes    : {list(le_risk.classes_)}")

    # ── Scale features ─────────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── Train / test split ─────────────────────────────────────────────────────
    X_train, X_test, yo_train, yo_test, yr_train, yr_test = train_test_split(
        X_scaled, y_outcome_enc, y_risk_enc,
        test_size=0.2, random_state=42, stratify=y_outcome_enc
    )

    models = build_models()
    metrics_all = {}
    best_name, best_model, best_f1 = None, None, -1.0

    # ── Train & compare – Learning Outcome ────────────────────────────────────
    print("\n" + "═" * 50)
    print("  LEARNING OUTCOME PREDICTION")
    print("═" * 50)
    for name, clf in models.items():
        clf.fit(X_train, yo_train)
        m = evaluate(clf, X_test, yo_test, name)
        metrics_all[name] = m
        if m["f1"] > best_f1:
            best_f1 = m["f1"]
            best_name = name
            best_model = clf

    print(f"\n[train_model] ✓ Best outcome model : {best_name}  (F1={best_f1:.4f})")

    # ── Train risk model with best algorithm ──────────────────────────────────
    print("\n" + "═" * 50)
    print("  RISK LEVEL PREDICTION (using best algorithm)")
    print("═" * 50)
    risk_model = build_models()[best_name]
    risk_model.fit(X_train, yr_train)
    evaluate(risk_model, X_test, yr_test, f"{best_name} – Risk")

    # ── Feature importance (Random Forest / GB only) ──────────────────────────
    feature_importance = {}
    if hasattr(best_model, "feature_importances_"):
        fi = dict(zip(FEATURES, best_model.feature_importances_.round(4).tolist()))
        feature_importance = dict(sorted(fi.items(), key=lambda x: -x[1]))
        print("\n[train_model] Feature importance (top-10):")
        for k, v in list(feature_importance.items())[:10]:
            print(f"  {k:<40} {v:.4f}")

    # ── Persist artefacts ─────────────────────────────────────────────────────
    joblib.dump(best_model, os.path.join(DATA_DIR, "outcome_model.pkl"))
    joblib.dump(risk_model, os.path.join(DATA_DIR, "risk_model.pkl"))
    joblib.dump(le_outcome, os.path.join(DATA_DIR, "label_encoder_outcome.pkl"))
    joblib.dump(le_risk, os.path.join(DATA_DIR, "label_encoder_risk.pkl"))
    joblib.dump(scaler, os.path.join(DATA_DIR, "scaler.pkl"))

    metrics_report = {
        "best_model": best_name,
        "outcome_models": metrics_all,
        "feature_importance": feature_importance,
        "outcome_classes": list(le_outcome.classes_),
        "risk_classes": list(le_risk.classes_),
    }
    with open(os.path.join(DATA_DIR, "model_metrics.json"), "w") as f:
        json.dump(metrics_report, f, indent=2)

    print("\n[train_model] ✓ All artefacts saved to", DATA_DIR)
    return metrics_report


if __name__ == "__main__":
    train_and_save()
