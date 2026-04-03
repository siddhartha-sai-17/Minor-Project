import json

from flask import Blueprint, jsonify, request

from backend.models import StudentAnalysis, db
from backend.services.analysis_engine import generate_analysis, compute_learning_health_score
from backend.services.predictor import predict, get_model_metrics
from backend.utils.auth_helpers import token_required
from backend.utils.validators import validate_prediction_input

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api/analysis")


@prediction_bp.route("/predict", methods=["POST"])
@token_required
def run_prediction(current_user):
    """
    Accepts 15 feature inputs from a logged-in user.
    Validates, infers ML model outcomes, generates structured text analysis,
    saves the entire record to DB, and returns the enriched result.
    """
    raw_data = request.get_json() or {}

    # ── 1. Validate inputs ─────────────────────────────────────────────────────
    clean_data, errors = validate_prediction_input(raw_data)
    if errors:
        return jsonify({"validation_errors": errors}), 422

    try:
        # ── 2. ML Inference ───────────────────────────────────────────────────
        ml_result = predict(clean_data)

        # ── 3. Compute Learning Health Score ─────────────────────────────────
        health_score = compute_learning_health_score(clean_data)

        # ── 4. Generate Structured Analysis & Recommendations ─────────────────
        insights, recommendations = generate_analysis(clean_data, ml_result)

        # ── 5. Save to Database ───────────────────────────────────────────────
        new_analysis = StudentAnalysis(
            user_id=current_user.id,
            # Inputs
            daily_study_hours=clean_data["daily_study_hours"],
            attendance_percentage=clean_data["attendance_percentage"],
            assignment_submission_rate=clean_data["assignment_submission_rate"],
            late_submission_count=clean_data["late_submission_count"],
            revision_frequency_per_week=clean_data["revision_frequency_per_week"],
            lms_login_frequency_per_week=clean_data["lms_login_frequency_per_week"],
            lms_time_spent_hours_per_week=clean_data["lms_time_spent_hours_per_week"],
            video_lectures_watched_per_week=clean_data["video_lectures_watched_per_week"],
            practice_quiz_attempts=clean_data["practice_quiz_attempts"],
            class_participation_score=clean_data["class_participation_score"],
            search_skill_score=clean_data["search_skill_score"],
            source_evaluation_score=clean_data["source_evaluation_score"],
            time_management_score=clean_data["time_management_score"],
            procrastination_score=clean_data["procrastination_score"],
            stress_level=clean_data["stress_level"],
            # Outputs
            predicted_learning_outcome=ml_result["predicted_learning_outcome"],
            predicted_risk_level=ml_result["predicted_risk_level"],
            confidence_score=ml_result["confidence_score"],
            analysis_summary=json.dumps(insights),
            recommendations=json.dumps(recommendations),
        )

        db.session.add(new_analysis)
        db.session.commit()

        # ── 6. Build enriched response ────────────────────────────────────────
        result_dict = new_analysis.to_dict()
        result_dict["learning_health_score"] = health_score
        result_dict["feature_importance"] = ml_result.get("feature_importance", {})

        return jsonify({
            "message": "Analysis generated successfully",
            "result": result_dict
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@prediction_bp.route("/history", methods=["GET"])
@token_required
def get_user_history(current_user):
    """Retrieve all past analyses for the logged-in user, enriched with health score."""
    analyses = (
        StudentAnalysis.query
        .filter_by(user_id=current_user.id)
        .order_by(StudentAnalysis.created_at.desc())
        .all()
    )

    history = []
    for a in analyses:
        record = a.to_dict()
        # Compute health score from stored features
        record["learning_health_score"] = compute_learning_health_score(record)
        # Include feature importance if available from model metrics
        try:
            metrics = get_model_metrics()
            record["feature_importance"] = metrics.get("feature_importance", {})
        except Exception:
            record["feature_importance"] = {}
        history.append(record)

    return jsonify({
        "history": history,
        "count": len(history)
    }), 200


@prediction_bp.route("/<int:analysis_id>", methods=["GET"])
@token_required
def get_single_analysis(current_user, analysis_id):
    """Retrieve a specific analysis (must belong to current user), enriched with health score."""
    analysis = StudentAnalysis.query.get(analysis_id)

    if not analysis:
        return jsonify({"error": "Analysis not found"}), 404

    if analysis.user_id != current_user.id:
        return jsonify({"error": "Unauthorised access to this record"}), 403

    record = analysis.to_dict()
    record["learning_health_score"] = compute_learning_health_score(record)

    # Include feature importance from model metrics
    try:
        metrics = get_model_metrics()
        record["feature_importance"] = metrics.get("feature_importance", {})
    except Exception:
        record["feature_importance"] = {}

    return jsonify({"analysis": record}), 200


@prediction_bp.route("/system/metrics", methods=["GET"])
def get_model_info():
    """Public info endpoint dumping model training metrics and features."""
    try:
        metrics = get_model_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
