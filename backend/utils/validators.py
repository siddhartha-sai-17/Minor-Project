"""Input validation utilities for the prediction endpoint."""

from __future__ import annotations

FIELD_RULES: dict[str, dict] = {
    "daily_study_hours":             {"min": 0,   "max": 10,  "type": float},
    "attendance_percentage":         {"min": 0,   "max": 100, "type": float},
    "assignment_submission_rate":    {"min": 0,   "max": 100, "type": float},
    "late_submission_count":         {"min": 0,   "max": 20,  "type": int},
    "revision_frequency_per_week":   {"min": 0,   "max": 7,   "type": float},
    "lms_login_frequency_per_week":  {"min": 0,   "max": 14,  "type": float},
    "lms_time_spent_hours_per_week": {"min": 0,   "max": 20,  "type": float},
    "video_lectures_watched_per_week": {"min": 0, "max": 10,  "type": float},
    "practice_quiz_attempts":        {"min": 0,   "max": 20,  "type": int},
    "class_participation_score":     {"min": 1,   "max": 10,  "type": float},
    "search_skill_score":            {"min": 1,   "max": 10,  "type": float},
    "source_evaluation_score":       {"min": 1,   "max": 10,  "type": float},
    "time_management_score":         {"min": 1,   "max": 10,  "type": float},
    "procrastination_score":         {"min": 1,   "max": 10,  "type": float},
    "stress_level":                  {"min": 1,   "max": 10,  "type": float},
}


def validate_prediction_input(data: dict) -> tuple[dict, list[str]]:
    """
    Validate and coerce input data for the prediction endpoint.

    Returns
    -------
    (cleaned_data, errors)
    errors is an empty list if all fields are valid.
    """
    cleaned: dict = {}
    errors: list[str] = []

    for field, rules in FIELD_RULES.items():
        if field not in data:
            errors.append(f"'{field}' is required.")
            continue

        raw = data[field]
        try:
            value = rules["type"](raw)
        except (ValueError, TypeError):
            errors.append(f"'{field}' must be a valid number.")
            continue

        if value < rules["min"] or value > rules["max"]:
            errors.append(
                f"'{field}' must be between {rules['min']} and {rules['max']} (got {value})."
            )
            continue

        cleaned[field] = value

    return cleaned, errors
