import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext/AuthContext.jsx'

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or splash

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};


export default ProtectedRoutes
