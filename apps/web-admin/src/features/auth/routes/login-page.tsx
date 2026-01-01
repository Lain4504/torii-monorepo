import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAuthenticated, setError, selectAuthError } from '@/store/slices/auth-slice';
import { setUser } from '@/store/slices/user-slice';
import { apiClient } from '@/lib/api-client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { toast } from '@workspace/ui/components/sonner';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for form

  const error = useAppSelector(selectAuthError);

  // Check if already authenticated
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const response = await apiClient.get('/api/auth/profile');
        if (response.data.success) {
          navigate('/', { replace: true });
        }
      } catch {
        // Not authenticated, stay on login page
      }
    }
    checkExistingAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setError(null));

      // 1. Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Note: apiClient interceptor will automatically attach the token

      // 2. Fetch user profile (Backend verifies token)
      const profileResponse = await apiClient.get('/api/auth/profile');

      if (profileResponse.data.success && profileResponse.data.data) {
        const userData = profileResponse.data.data.user; // Ensure correct path to user object

        // Block learner role
        if (userData.role === 'learner') {
          dispatch(setError('Learners cannot access admin panel. Please use the learner portal.'));
          toast.error('Access denied: This is an admin-only application');
          return;
        }

        // Store user data in Redux
        dispatch(setUser({
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          status: userData.status || 'active',
          permissions: userData.permissions || [],
        }));

        dispatch(setAuthenticated({
          isAuthenticated: true,
          user: {
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            status: userData.status || 'active',
          }
        }));

        toast.success('Login successful!');
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      let errorMessage = 'Login failed. Please check your credentials.';

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Torii Nihongo Admin</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@torii.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p className="text-xs mt-1">Admin: admin@torii.jp / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
