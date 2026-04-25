# Project Review Details: EduPredict

## Overview
EduPredict is a full-stack intelligent web application that analyzes college student learning behavior, predicts learning outcomes, and provides personalized behavioral analysis using Machine Learning. The application is divided into a modern React frontend and a robust Python backend incorporating an SQLite database and an ML inference pipeline.

---

## Frontend Technologies
The frontend is designed to be highly interactive, responsive, and visually appealing using a modern "Glassmorphic" aesthetic.

- **React.js (v18)**: Chosen as the core component-based framework for the user interface. It makes the UI modular and state-driven, which is essential for managing dynamic dashboards and forms.
- **Vite**: Used as the build tool and development server. It is significantly faster than traditional tools like Create React App, providing instant Hot Module Replacement (HMR) for a smooth developer experience.
- **React Router DOM (v6)**: Responsible for routing. It ensures a seamless Single Page Application (SPA) experience by managing navigation between different views (Authentication, Dashboard, History) without full page reloads.
- **Axios**: A promise-based HTTP client configured to smoothly intercept and perform API calls to the backend, handle default headers (like JWT tokens), and manage API error states efficiently.
- **Recharts**: A composable charting library built on React components. It visually maps complex predictive metrics and historical data on the dashboard cleanly and interactively.
- **Framer Motion**: An animation library for React that powers smooth transitions, hover effects, and the dynamic rendering of dashboard statistics, establishing a premium look and feel.
- **Lucide React**: Supplies lightweight, clean, and modern scalable vector icons across the interface.

---

## Backend Technologies
The backend acts as the secure middle layer handling data persistence, authentication routes, and exposing the Machine Learning capabilities via RESTful APIs.

- **Python (v3.x)**: The anchor language. It is universally adopted for Data Science and Machine Learning, allowing frontend APIs to interface directly with Data/ML models in the same environment.
- **Flask (v3.0.x)**: A lightweight, extensible WSGI framework. Because the project focuses primarily on API delivery without the forced monolithic structures of heavier frameworks like Django, Flask allows for clean, fast, and modular routing.
- **Flask-CORS**: Resolves Cross-Origin Resource Sharing boundaries. It explicitly permits the frontend (running on a separate Vite port) to communicate securely with the Flask APIs.
- **PyJWT & bcrypt**:
  - **bcrypt**: Handles password hashing prior to database insertion. It ensures plaintext passwords are never stored, protecting user accounts aggressively.
  - **PyJWT**: Facilitates stateless token-based authentication. Users authenticate once, receive a JSON Web Token, and use it as authorization headers for private endpoints (such as retrieving their ML prediction history).
- **SQLAlchemy (Flask-SQLAlchemy)**: Acting as the Object Relational Mapper (ORM), it maps database tables to Python classes. It secures queries against SQL injection automatically and handles complex database migrations seamlessly.

---

## Machine Learning Pipeline
The analytical brain of the application, bridging raw data into actionable insights.

- **Scikit-Learn (sklearn)**: The foundational ML library used, providing preprocessing classes (like `StandardScaler` and `LabelEncoder`) and baseline algorithms (Logistic Regression, Random Forest, Gradient Boosting). It manages the model training and evaluation (F1-score, accuracy) pipelines.
- **XGBoost**: An advanced gradient boosting library incorporated for its high performance and superior execution speed on tabular academic data logic.
- **Pandas & NumPy**: Essential engines for vectorized data manipulation. They handle parsing the internal student dataset arrays, dropping nulls, managing features, and generating the synthetic dataset script logic.
- **Joblib**: Used for the serialization (`.pkl` files) of trained models, scalers, and encoders. By saving models to disk, Flask can load them instantly in memory to perform rapid real-time inference without retraining models dynamically for every user payload.

---

## Database Architecture
- **SQLite**: The chosen relational database system. Because SQLite operates directly on the local disk as a secure self-contained file (`slbaps.db`) without requiring a separate network process or dedicated hardware (like PostgreSQL/MySQL), it enables immediate testing, easy demonstration, and lightweight portability while fully supporting standard CRUD operations via SQLAlchemy.

---

## System Integration Summary
1. The **React Frontend** collects behavioral indicators via form inputs.
2. An HTTP payload is dispatched via **Axios** (including **PyJWT** credentials) to the **Flask Backend**.
3. **Flask** deserializes the data, sanitizes it using **Python validators**, and passes it to the **Predictor Service**.
4. The Predictor loads the **Joblib/Scikit-learn** model for inference, classifying the student's risk category.
5. The result passes through an internal **Analysis Engine** that converts raw ML outputs into contextual, varied text feedback.
6. **SQLAlchemy** logs the entire transaction to the **SQLite** database tying it to the user's account.
7. Finally, the categorized payload returns to the **React Frontend**, dynamically triggering **Framer Motion** alerts and updating **Recharts** metrics immediately.
