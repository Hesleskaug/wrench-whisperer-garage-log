
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';

interface GarageRouteProps {
  children: ReactNode;
}

const GarageRoute = ({ children }: GarageRouteProps) => {
  const { garageId, loading } = useGarage();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!garageId) {
    // Redirect to garage access page but save the attempted URL for future redirect
    return <Navigate to="/garage" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default GarageRoute;
