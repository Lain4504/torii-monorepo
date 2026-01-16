import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { login, checkAuth, selectAuthError, selectAuthLoading, setError } from '@/store/slices/auth-slice.ts';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { Checkbox } from "@workspace/ui/components/checkbox";

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
    dispatch(setError(null));

    try {
      const user = await dispatch(login(data)).unwrap();

      // Block learner role
      if (user.role === 'learner') {
        dispatch(setError('Learners cannot access admin panel.'));
        toast.error('Access denied: Admin portals are restricted.');
        return;
      }

      toast.success(`Welcome back, ${user.displayName || 'Admin'}`);
      navigate('/', { replace: true });
    } catch (err: any) {
      // Check for 2FA requirement in rejection payload
      if (err && typeof err === 'object' && err.requiresTwoFactor) {
        navigate('/auth/verify-2fa', {
          state: {
            tempToken: err.tempToken,
            twoFactorMethod: err.twoFactorMethod,
          },
          replace: true,
        });
        return;
      }

      // Error message already extracted by extractErrorMessage in auth-slice
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Authentication failed');
      toast.error(errorMessage);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-background antialiased selection:bg-primary/20 selection:text-primary">
      {/* Left Panel: Hero / Brand - Zen UI Pro */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/5 flex-col justify-between p-16 border-r border-border/10">
        {/* Subtle Gradient Spots */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

        {/* Header Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 10h18" strokeLinecap="round" />
                <path d="M5 10v8" strokeLinecap="round" />
                <path d="M19 10v8" strokeLinecap="round" />
                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-medium tracking-tight text-foreground">Torii <span className="text-primary italic">Admin</span></span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
              Manage your <br />
              <span className="text-primary italic">Education Platform</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed max-w-md">
              Streamline course management, student engagement, and content delivery from one central dashboard.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center gap-6 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">
          <span>© 2026 Torii HQ</span>
          <div className="h-px w-8 bg-border/20"></div>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" />
            Secure Connection
          </span>
        </div>
      </div>

      {/* Right Panel: Login Form - Zen UI Pro */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-16 relative bg-background">
        <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground/60">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-5">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label htmlFor={field.name} className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70 ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="name@example.com"
                        className="h-12 pl-11 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/30"
                        autoComplete="email"
                        type="email"
                      />
                      {fieldState.invalid && <p className="text-[10px] font-medium text-rose-500 mt-1.5 ml-1">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label htmlFor={field.name} className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                        Password
                      </label>
                      <button type="button" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors">Forgot password?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 pl-11 pr-12 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/30"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50 text-muted-foreground/40 hover:text-foreground transition-colors rounded-lg"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      {fieldState.invalid && <p className="text-[10px] font-medium text-rose-500 mt-1.5 ml-1">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex items-center gap-3 px-1">
              <Checkbox id="remember" className="rounded-md size-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor="remember" className="text-xs font-medium text-muted-foreground/70 cursor-pointer select-none hover:text-foreground transition-colors">Remember for 30 days</label>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/5 border border-rose-500/10 p-4 flex items-center gap-3 animate-in fade-in zoom-in-95">
                <div className="size-1.5 rounded-full bg-rose-500 shrink-0" />
                <p className="text-xs font-medium text-rose-500">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin opacity-70" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 size-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
