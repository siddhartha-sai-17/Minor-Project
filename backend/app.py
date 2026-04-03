import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from backend.config import Config
from backend.models import db
from backend.routes.auth_routes import auth_bp
from backend.routes.prediction_routes import prediction_bp

# Load environment variables (if .env is present)
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing for React Frontend
    CORS(app)

    # Init database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)

    @app.route("/", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "online",
            "service": "Student Learning Behavior Analysis System API"
        }), 200

    # Ensure DB tables exist on startup
    with app.app_context():
        db.create_all()
        print(f"[app] Configured database: {app.config['SQLALCHEMY_DATABASE_URI']}")

    return app

if __name__ == "__main__":
    # Ensure current directory is accessible
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
