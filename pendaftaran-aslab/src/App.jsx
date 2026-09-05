import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './Login';
import DashboardPendaftar from './DashboardPendaftar';
import DashboardAdmin from './DashboardAdmin';
import ProtectedRoute from './ProtectedRoute';

export default function App() {
  const clientId = "987776898962-bmdr0ktk1rj35q3lnbs7t47dom7hhrb6.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Rute Ujian dilindungi, hanya dapat diakses oleh akun pendaftar */}
          <Route
            path="/ujian"
            element={
              <ProtectedRoute peranDibutuhkan="pendaftar">
                <DashboardPendaftar />
              </ProtectedRoute>
            }
          />

          {/* Rute Admin dilindungi, hanya dapat diakses oleh akun penguji */}
          <Route
            path="/admin-portal"
            element={
              <ProtectedRoute peranDibutuhkan="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}