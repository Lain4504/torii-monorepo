import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAuthenticated, setLoading, setError, selectAuthError } from '@/store/slices/auth-slice';
import { setUser } from '@/store/slices/user-slice';
import { apiClient } from '@/lib/api-client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { toast } from '@workspace/ui/components/sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Step 1: Call login API (sets HTTP-only cookies)
      const loginResponse = await apiClient.post('/api/auth/login', { email, password });

      if (loginResponse.data.success) {
        // Step 2: Fetch user profile with RBAC data
        const profileResponse = await apiClient.get('/api/auth/profile');

        if (profileResponse.data.success && profileResponse.data.data?.user) {
          const userData = profileResponse.data.data.user;

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
            avatarUrl: null, // Backend doesn't provide this field
            role: userData.role,
            status: userData.status,
            permissions: userData.permissions || [],
          }));

          // Set authenticated state BEFORE navigation to prevent race condition
          dispatch(setAuthenticated({ isAuthenticated: true, user: userData }));
          dispatch(setLoading(false)); // ← Important: Tell AuthGuard we're done

          toast.success('Login successful!');
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
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
