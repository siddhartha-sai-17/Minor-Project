# How to Run EduPredict

To run the full EduPredict application locally, you need to open **two separate terminal windows**—one for the backend API and one for the frontend user interface.

## 1. Start the Backend API (Flask)
The backend requires its virtual environment to be activated and needs to run from the root project folder so it can access the database and machine learning models correctly.

1. Open a new terminal.
2. Navigate to your project folder:
   ```powershell
   cd c:\Users\bojja\Downloads\lawada\lawada
   ```
3. Run the Flask server using the Python executable inside your virtual environment:
   ```powershell
   backend\venv\Scripts\python.exe -m flask --app backend.app:create_app run --host=0.0.0.0 --port=5000 --debug
   ```

*You should see it say "Running on http://127.0.0.1:5000". Leave this terminal window open.*

---

## 2. Start the Frontend UI (React / Vite)
The frontend uses Node.js and Vite to serve the React application and automatically reload when you make code changes.

1. Open a **second** new terminal window.
2. Navigate directly to the `frontend` folder:
   ```powershell
   cd c:\Users\bojja\Downloads\lawada\lawada\frontend
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

*You should see it say "➜  Local: http://localhost:3000/".*

---

## 3. View the Application
Once both servers are running, open your web browser (Chrome, Edge, Firefox, etc.) and navigate exactly to:

👉 **[http://localhost:3000](http://localhost:3000)**

## Troubleshooting
- **Refused to connect (localhost:3000):** If Vite dies or stops in the background, simply press `Ctrl + C` in the frontend terminal and type `npm run dev` again to freshly restart it.
- **API Errors / 500 Responses:** Make sure the backend terminal is actually running without any Python crash traces. If the backend is stopped, the frontend will freeze on loading screens or say "Failed to load analysis."
