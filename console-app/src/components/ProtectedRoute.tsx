import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrganization?: boolean;
}

export default function ProtectedRoute({ children, requireOrganization = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (authLoading || (user && requireOrganization && orgLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect to organization setup if no organization
  if (requireOrganization && !currentOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Organization Found
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be part of an organization to access this page.
            Please create an organization or wait for an invitation.
          </p>
          <button
            onClick={() => window.location.href = '/auth/signup'}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}