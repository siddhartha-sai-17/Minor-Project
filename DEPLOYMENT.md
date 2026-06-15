# Deployment Guide: EduPredict

This guide outlines how to deploy the **EduPredict** application in a production-ready environment.

---

## 1. Backend Deployment on Render

We have pre-configured a Render Blueprint (`render.yaml`) to set up a Python web service and a PostgreSQL database on Render automatically.

### Option A: Automatic Deployment via Render Blueprint (Recommended)
1. Commit all your changes to a **GitHub repository**.
2. Log in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New** (top right) and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically parse the `render.yaml` file in the root.
6. Click **Apply** to automatically spin up:
   - A free **PostgreSQL Database** (`edupredict-db`).
   - A free **Python Web Service** (`edupredict-backend`) that compiles, trains the ML model, and exposes the Flask REST API.

---

### Option B: Manual Deployment via Render Dashboard
If you prefer to configure the services manually on Render, follow these steps:

#### Step 1: Create a PostgreSQL Database
1. Go to your Render Dashboard and click **New > PostgreSQL**.
2. Set the name to `edupredict-db`.
3. Select the **Free** tier.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (needed in the next step).

#### Step 2: Create a Web Service for the Backend
1. Go to your Render Dashboard and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `edupredict-backend`
   - **Language**: `Python`
   - **Branch**: `main` (or whichever branch you want to deploy)
   - **Build Command**: 
     ```bash
     pip install -r backend/requirements.txt -r backend/requirements-prod.txt && python backend/services/train_model.py
     ```
   - **Start Command**: 
     ```bash
     gunicorn --bind 0.0.0.0:$PORT "backend.app:create_app()"
     ```
   - **Plan**: Select the **Free** tier.
4. Click **Advanced** and add the following **Environment Variables**:
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1.
   - `SECRET_KEY`: Enter a secure random string (used for JWT signing).
   - `PORT`: `5000`
   - `PYTHON_VERSION`: `3.13.3` (or your local python version).
5. Click **Create Web Service**.

---

## 2. Connecting the Frontend

The React frontend uses the Vite environment variable `VITE_API_URL` to determine where backend requests should go.

### Running Frontend Locally with Deployed Backend
If you want to run your frontend locally but connect to the production database and backend running on Render, set up your local environment:
1. In the `frontend/` directory, create a `.env` file (if not already present).
2. Add the following line:
   ```env
   VITE_API_URL=https://edupredict-backend.onrender.com
   ```
   *(Replace `https://edupredict-backend.onrender.com` with the actual **OnRender** URL of your deployed backend Web Service).*
3. Run `npm run dev` in the frontend directory.

### Deploying Frontend on Render (Optional)
If you want to host your frontend on Render as well:
1. Click **New > Static Site** in Render.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `edupredict-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `frontend/dist`
4. Click **Advanced** and add the Environment Variable:
   - `VITE_API_URL`: Your deployed Render backend URL.
5. Click **Create Static Site**.
