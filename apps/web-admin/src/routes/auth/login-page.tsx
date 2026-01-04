import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { login, checkAuth, selectAuthError, selectAuthLoading, setError } from '@/store/slices/auth-slice.ts';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Form,
  FormField,
} from '@workspace/ui/components/form';
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from '@workspace/ui/components/field';
import { toast } from '@workspace/ui/components/sonner';
import { Spinner } from '@workspace/ui/components/spinner';
import { Eye, EyeOff, ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);

  // Initial check - redirect if already authenticated
  useEffect(() => {
    dispatch(checkAuth())
      .unwrap()
      .then((user) => {
        if (user) navigate('/', { replace: true });
      })
      .catch(() => {
        // Not authenticated, stay on login page
      });
  }, [dispatch, navigate]);

  const form = useForm<UserLoginDTO>({
    resolver: zodResolver(userLoginDTOSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: UserLoginDTO) => {
    try {
      const resultAction = await dispatch(login(data));

      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        if (user.role === 'learner') {
          dispatch(setError('Learners cannot access admin panel.'));
          toast.error('Access denied: Admin only.');
          return;
        }
        toast.success('Login successful!');
        navigate('/', { replace: true });
      } else {
        toast.error(typeof resultAction.payload === 'string' ? resultAction.payload : 'Login failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40 z-0" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

        <div className="relative z-10 p-12 text-white max-w-lg space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Torii Admin</h1>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Connect. Manage. <span className="text-blue-400">Scale.</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            The central command for Torii Nihongo's learning ecosystem. Manage users, monitor progress, and oversee the platform with ease.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <LayoutDashboard className="h-6 w-6 text-blue-400 mb-2" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-slate-400">Real-time data insights</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-slate-400">RBAC & Audit Logs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Please sign in to your admin account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-slate-900 font-medium">Email Address</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="admin@torii.jp"
                        {...field}
                        className="bg-white dark:bg-slate-900 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                      />
                    </FieldContent>
                    <FieldError errors={[{ message: fieldState.error?.message }]} />
                  </Field>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-slate-900 font-medium">Password</FieldLabel>
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <FieldContent>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pr-10 bg-white dark:bg-slate-900 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FieldContent>
                    <FieldError errors={[{ message: fieldState.error?.message }]} />
                  </Field>
                )}
              />

              {error && (
                <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-lg flex items-center animate-in fade-in slide-in-from-top-1">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                disabled={loading}
              >
                {loading && <Spinner className="mr-2" />}
                {loading ? 'Signing in...' : 'Sign In to Dashboard'}
              </Button>
            </form>
          </Form>

          <div className="pt-6 text-center">
            <p className="text-xs text-slate-500">
              Protected by Torii Security Systems. <br />
              Unauthorized access is prohibited and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
