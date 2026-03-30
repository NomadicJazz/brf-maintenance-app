import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { RequireAuth } from './auth/RequireAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import IssuesPage from './pages/IssuesPage'
import IssueDetailPage from './pages/IssueDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/issues" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/issues"
        element={
          <RequireAuth>
            <IssuesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/issues/:issueId"
        element={
          <RequireAuth>
            <IssueDetailPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/issues" replace />} />
    </Routes>
  )
}
