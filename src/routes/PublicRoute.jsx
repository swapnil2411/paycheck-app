import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext/AuthContext.jsx'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 🔥 allow page to render while auth resolves
  if (loading) return children;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};


export default PublicRoute