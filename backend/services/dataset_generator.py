"""
dataset_generator.py
--------------------
Generates a realistic synthetic dataset of student learning behaviours
and saves it as a CSV file. Designed to be run as a standalone script.

Run:
    python -m backend.services.dataset_generator
or:
    python backend/services/dataset_generator.py
"""

import os
import numpy as np
import pandas as pd

# ── Configuration ──────────────────────────────────────────────────────────────
N_ROWS = 3000
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "student_learning_dataset.csv"
)


# ── Helper: clipped normal distribution ───────────────────────────────────────
def _cn(mu, sigma, low, high, size):
    """Clipped Normal distribution."""
    return np.clip(np.random.normal(mu, sigma, size), low, high)


def generate_dataset(n_rows: int = N_ROWS) -> pd.DataFrame:
    """
    Generate a synthetic student learning dataset with realistic relationships.

    Feature ranges
    --------------
    daily_study_hours              : 0 – 10  h
    attendance_percentage          : 30 – 100 %
    assignment_submission_rate     : 0 – 100 %
    late_submission_count          : 0 – 20  (int)
    revision_frequency_per_week    : 0 – 7   times
    lms_login_frequency_per_week   : 0 – 14  times
    lms_time_spent_hours_per_week  : 0 – 20  h
    video_lectures_watched_per_week: 0 – 10  videos
    practice_quiz_attempts         : 0 – 20  (int)
    class_participation_score      : 1 – 10  (score)
    search_skill_score             : 1 – 10
    source_evaluation_score        : 1 – 10
    time_management_score          : 1 – 10
    procrastination_score          : 1 – 10  (higher = worse)
    stress_level                   : 1 – 10  (higher = worse)
    """
    size = n_rows

    # ── Raw features ──────────────────────────────────────────────────────────
    df = pd.DataFrame()

    df["daily_study_hours"] = np.round(_cn(4.5, 2.0, 0, 10, size), 1)
    df["attendance_percentage"] = np.round(_cn(75, 15, 30, 100, size), 1)
    df["assignment_submission_rate"] = np.round(_cn(78, 18, 0, 100, size), 1)
    df["late_submission_count"] = np.clip(
        np.random.poisson(3, size), 0, 20
    ).astype(int)
    df["revision_frequency_per_week"] = np.round(_cn(2.5, 1.5, 0, 7, size), 1)
    df["lms_login_frequency_per_week"] = np.round(_cn(5, 3, 0, 14, size), 1)
    df["lms_time_spent_hours_per_week"] = np.round(_cn(6, 4, 0, 20, size), 1)
    df["video_lectures_watched_per_week"] = np.round(_cn(4, 2.5, 0, 10, size), 1)
    df["practice_quiz_attempts"] = np.clip(
        np.random.poisson(5, size), 0, 20
    ).astype(int)
    df["class_participation_score"] = np.round(_cn(6, 2, 1, 10, size), 1)
    df["search_skill_score"] = np.round(_cn(6, 2, 1, 10, size), 1)
    df["source_evaluation_score"] = np.round(_cn(5.5, 2, 1, 10, size), 1)
    df["time_management_score"] = np.round(_cn(6, 2, 1, 10, size), 1)
    df["procrastination_score"] = np.round(_cn(5, 2, 1, 10, size), 1)
    df["stress_level"] = np.round(_cn(5, 2, 1, 10, size), 1)

    # ── Weighted composite score (0 – 100) ────────────────────────────────────
    #  Positive contributors (normalised to 0-1 range before weighting)
    score = (
        (df["daily_study_hours"] / 10) * 14
        + (df["attendance_percentage"] / 100) * 14
        + (df["assignment_submission_rate"] / 100) * 12
        + (df["revision_frequency_per_week"] / 7) * 10
        + (df["lms_login_frequency_per_week"] / 14) * 6
        + (df["lms_time_spent_hours_per_week"] / 20) * 6
        + (df["video_lectures_watched_per_week"] / 10) * 5
        + (df["practice_quiz_attempts"] / 20) * 8
        + ((df["class_participation_score"] - 1) / 9) * 7
        + ((df["search_skill_score"] - 1) / 9) * 4
        + ((df["source_evaluation_score"] - 1) / 9) * 4
        + ((df["time_management_score"] - 1) / 9) * 8
        # Negative contributors
        - (df["late_submission_count"] / 20) * 8
        - ((df["procrastination_score"] - 1) / 9) * 10
        - ((df["stress_level"] - 1) / 9) * 6
    )

    # Add Gaussian noise to prevent perfect separability
    score += np.random.normal(0, 3, size)
    score = np.clip(score, 0, 100)

    # ── Learning outcome label ─────────────────────────────────────────────────
    #  Percentile-based cut-offs (keeps class balance realistic)
    p25, p50, p75 = np.percentile(score, [25, 50, 75])

    def outcome_label(s):
        if s >= p75:
            return "Excellent"
        elif s >= p50:
            return "Good"
        elif s >= p25:
            return "Average"
        else:
            return "Poor"

    df["learning_outcome"] = score.apply(outcome_label)

    # ── Risk level label ───────────────────────────────────────────────────────
    def risk_label(s):
        if s >= p50:
            return "Low"
        elif s >= p25:
            return "Medium"
        else:
            return "High"

    df["risk_level"] = score.apply(risk_label)

    return df


def save_dataset(df: pd.DataFrame, path: str = OUTPUT_PATH) -> str:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"[dataset_generator] Saved {len(df):,} rows → {path}")
    return path


if __name__ == "__main__":
    df = generate_dataset()
    save_dataset(df)
    print("\nLabel distribution (learning_outcome):")
    print(df["learning_outcome"].value_counts())
    print("\nLabel distribution (risk_level):")
    print(df["risk_level"].value_counts())
