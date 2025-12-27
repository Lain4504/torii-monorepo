import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  // Chưa cần login, redirect về dashboard
  return <Navigate to="/" replace />;
}

