import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import PredictionFormPage from './pages/PredictionFormPage'
import ResultsPage from './pages/ResultsPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="predict" element={<PredictionFormPage />} />
          <Route path="results/:id" element={<ResultsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/*" element={<AdminPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
