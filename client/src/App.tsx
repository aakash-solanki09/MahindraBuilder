// Deployment Trigger: Final Sync
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminBuilder from './pages/AdminBuilder';
import AdminDashboard from './pages/AdminDashboard';
import LivePage from './pages/LivePage';
import Login from './pages/Login';
import ThankYouPage from './pages/ThankYouPage';

const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userRaw);
    if (user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/builder/:id"
          element={
            <RequireAdmin>
              <AdminBuilder />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/builder"
          element={
            <RequireAdmin>
              <AdminBuilder />
            </RequireAdmin>
          }
        />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/:slug/thank-you" element={<ThankYouPage />} />
        <Route path="/:slug" element={<LivePage />} />
        <Route path="/" element={<LivePage />} />
        
        {/* Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
