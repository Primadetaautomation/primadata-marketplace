import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<CandidateDetail />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;