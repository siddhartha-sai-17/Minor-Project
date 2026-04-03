# EduPredict: Student Learning Behavior Analysis System

A full-stack intelligent web application that analyzes college student learning behavior, predicts learning outcomes, and provides personalized behavioral analysis using Machine Learning.

## Features Built
1. **Synthetic Dataset Generation**: Custom Python script utilizing realistic weighted logic based on 15 academic indicators.
2. **Machine Learning Pipeline**: Trains Logistic Regression, Random Forest, and Gradient Boosting models, selecting the best model based on F1-score.
3. **Smart Rule-Based Analysis Engine**: Generates personalized, varied, and dynamic feedback rather than static recommendations.
4. **Flask Backend API**: Fully RESTful interface, SQLite mapped via SQLAlchemy, JWT-based authentication, validation, and a centralized database.
5. **Modern React Frontend**: Stunning Glassmorphic UI with dynamic dashboard mapping, client-side routing, protected routes, and custom CSS without requiring generic CSS frameworks.

## Project Structure

```text
root/
├── backend/
│   ├── app.py                     # Flask application entry point
│   ├── config.py                  # Environment config
│   ├── models.py                  # SQLAlchemy models (User, StudentAnalysis)
│   ├── requirements.txt           # Python dependencies
│   ├── data/
│   │   ├── best_model.pkl         # Trained models & metrics
│   │   ├── student_learning_dataset.csv 
│   │   └── slbaps.db              # SQLite Database
│   ├── routes/
│   │   ├── auth_routes.py         # Login/Registration Endpoints
│   │   └── prediction_routes.py   # Main Prediction & History Endpoints
│   ├── services/
│   │   ├── dataset_generator.py   # Logic to generate synthetic data
│   │   ├── train_model.py         # Scikit-learn Pipeline
│   │   ├── predictor.py           # ML Inference Logic
│   │   └── analysis_engine.py     # AI Contextual Rule Engine
│   └── utils/
│       ├── auth_helpers.py        # bcrypt & JWT Helpers
│       └── validators.py          # Input Sanitization
│
└── frontend/
    ├── index.html                 # HTML Layout Template
    ├── package.json               # Node Package dependencies
    ├── vite.config.js             # Vite DevServer Options
    └── src/
        ├── App.jsx                # Router & Auth Context Layer
        ├── index.css              # Core Design System
        ├── App.css                # Component Styles
        ├── main.jsx               # React Mount Point
        └── pages/                 # Full Front Pages
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── ResultsPage.jsx
            └── HistoryPage.jsx
```

## Step-by-Step Run Instructions

These instructions guarantee a smooth run for demonstration scenarios.

### 1. Backend Setup

Open a terminal and navigate to the project directory:

```bash
cd backend

# Create and activate a virtual environment 
# (Windows)
python -m venv venv
.\venv\Scripts\activate

# (Mac/Linux)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Dataset Generation & Model Training

This command acts identically to train the model, generating the dataset if missing. We must ensure the repository root is in the python path!

```bash
# Set PYTHONPATH so absolute imports resolve natively
# (Windows)
$env:PYTHONPATH = (Get-Location).Path
# (Mac/Linux)
export PYTHONPATH=$(pwd)

# Generate Dataset & Train Model
python services/train_model.py
```
> *This will generate `backend/data/student_learning_dataset.csv`, construct the metrics JSON, and serialize `.pkl` objects (Scalers, Encoders, Models).*

### 3. Start Backend API

In the same terminal environment, you can now launch Flask.
*(The SQLite database `data/slbaps.db` will be auto-generated at startup)*.

```bash
# Still inside backend folder with venv active
python app.py
```
*The backend API server will run at `http://127.0.0.1:5000`.*

---

### 4. Frontend Setup

Open a **new separate terminal** to handle the frontend node environment.

```bash
cd frontend

# Install all node dependencies (React, Vite, Recharts, Lucide, Axios, ReactRouter)
npm install

# Start the Vite development server
npm run dev
```

*The frontend application will be served at `http://localhost:3000` or `http://localhost:5173` (Read your terminal output for exact URL). Vite is proxying the `/api` requests specifically dynamically into the 5000 port Flask server.*

### 5. Access Information

1. Navigate to the Frontend URL given by `npm run dev`.
2. Observe the animated landing page and head to **Sign Up**.
3. Create a fresh account (`john@example.com` / `password123`) which hashes via `bcrypt` to your backend sqlite database!
4. Proceed to **New Analysis**, enter metrics matching what an A-Student (Excellent) or D-Student (Risk) does, and observe your dynamic metrics!
5. All runs persist back onto the database under your specific student profile allowing history playback!
