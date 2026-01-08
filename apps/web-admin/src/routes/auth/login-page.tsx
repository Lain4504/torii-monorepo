import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { login, checkAuth, selectAuthError, selectAuthLoading, setError } from '@/store/slices/auth-slice.ts';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field';
import { toast } from '@workspace/ui/components/sonner';
import { Eye, EyeOff, Loader2, ShieldCheck, BarChart3, Users, Globe2 } from 'lucide-react';
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";

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
    } catch (err: unknown) {
      // Error message already extracted by extractErrorMessage in auth-slice
      const errorMessage = typeof err === 'string' ? err : 'Authentication failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background antialiased">
      {/* Left Panel: Hero / Brand - Hidden on mobile - Zen Style */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 flex-col justify-between p-16">
        {/* Background Effects - Soothing pastel gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-primary/8 blur-[120px] animate-pulse duration-[10000ms]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-accent/8 blur-[120px] animate-pulse duration-[15000ms]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-secondary/6 blur-[100px]" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 shadow-lg backdrop-blur-sm text-primary font-bold text-2xl transition-transform hover:scale-105">T</div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-foreground">Torii Admin</span>
              <p className="text-xs text-muted-foreground/70 mt-0.5 uppercase tracking-wider">Zen Workspace</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Find Your Inner<br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">Peace Through Learning</span>
            </h1>
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-lg">
              A calming workspace to manage courses, monitor progress, and nurture the learning journey with clarity and focus.
            </p>
          </div>

          {/* Feature Pills - Zen Style */}
          <div className="grid gap-4">
            <div className="group flex items-center gap-5 rounded-2xl bg-card/60 backdrop-blur-sm p-5 border border-border/50 shadow-sm transition-all duration-300 hover:bg-card/80 hover:shadow-md hover:border-primary/30 cursor-pointer">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">Real-time Analytics</h3>
                <p className="text-sm text-muted-foreground/80">Monitor engagement and growth with clarity.</p>
              </div>
            </div>

            <div className="group flex items-center gap-5 rounded-2xl bg-card/60 backdrop-blur-sm p-5 border border-border/50 shadow-sm transition-all duration-300 hover:bg-card/80 hover:shadow-md hover:border-secondary/30 cursor-pointer">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary-foreground group-hover:scale-110 transition-transform duration-300">
                <Users className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">User Management</h3>
                <p className="text-sm text-muted-foreground/80">Role-based access with mindful organization.</p>
              </div>
            </div>

            <div className="group flex items-center gap-5 rounded-2xl bg-card/60 backdrop-blur-sm p-5 border border-border/50 shadow-sm transition-all duration-300 hover:bg-card/80 hover:shadow-md hover:border-accent/30 cursor-pointer">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-foreground group-hover:scale-110 transition-transform duration-300">
                <Globe2 className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">Global Reach</h3>
                <p className="text-sm text-muted-foreground/80">Connect learners worldwide seamlessly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-muted-foreground/60 font-medium tracking-widest uppercase">
          <span>© 2026 Torii System</span>
          <span className="h-px w-12 bg-border/50"></span>
          <span>Peaceful & Secure</span>
        </div>
      </div>

      {/* Right Panel: Login Form - Zen Style */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-16 relative bg-background">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 text-primary font-bold text-xl">T</div>
            <span className="text-xl font-bold tracking-tight text-foreground">Torii Admin</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground/80">Enter your credentials to continue your journey</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground ml-1">
                    Email address
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="name@company.com"
                    className="h-12 border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/30 dark:focus-visible:ring-primary/40 rounded-xl transition-all duration-200 pl-4"
                    autoComplete="email"
                    type="email"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} className="ml-1 text-xs" />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between ml-1">
                    <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground">
                      Password
                    </FieldLabel>
                    <Button variant="link" className="p-0 h-auto font-medium text-xs text-primary/80 hover:text-primary transition-colors" type="button">Forgot password?</Button>
                  </div>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your password"
                      className="h-12 pr-12 border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/30 dark:focus-visible:ring-primary/40 rounded-xl transition-all duration-200 pl-4"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 px-0 hover:bg-muted/50 text-muted-foreground/60 hover:text-foreground transition-colors rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} className="ml-1 text-xs" />}
                </Field>
              )}
            />

            <div className="flex items-center space-x-3 pt-1 ml-1">
              <Checkbox id="remember" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-border/50 rounded-md size-4" />
              <Label htmlFor="remember" className="text-sm font-medium leading-none text-muted-foreground/80 cursor-pointer select-none hover:text-foreground transition-colors">Remember me for 30 days</Label>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 dark:bg-destructive/15 border border-destructive/30 p-4 text-sm text-destructive font-medium flex items-center gap-3 animate-in fade-in zoom-in-95">
                <ShieldCheck className="size-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-semibold text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="px-4 text-center text-xs text-muted-foreground/70 leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
