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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
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
    try {
      const resultAction = await dispatch(login(data));

      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        // Basic protection check on frontend
        if (user.role === 'learner') {
          dispatch(setError('Learners cannot access admin panel.'));
          toast.error('Access denied: Admin portals are restricted.');
          return;
        }
        toast.success(`Welcome back, ${user.displayName || 'Admin'}`);
        navigate('/', { replace: true });
      } else {
        toast.error(typeof resultAction.payload === 'string' ? resultAction.payload : 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background antialiased">
      {/* Left Panel: Hero / Brand - Hidden on mobile */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-slate-950 flex-col justify-between p-16 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse duration-[10000ms]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse duration-[15000ms]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/10 shadow-2xl backdrop-blur-xl text-white font-bold text-2xl">T</div>
            <span className="text-2xl font-bold tracking-tight text-white/90">Torii Admin</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-10">
          <h1 className="text-6xl font-bold tracking-tight leading-[1.1]">
            Command Center<br />
            for <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Modern Education</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
            Streamline operations, manage courses, and monitor learner progress from one centralized, powerful dashboard.
          </p>

          {/* Feature Pills */}
          <div className="grid gap-4">
            <div className="group flex items-center gap-5 rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-md shadow-sm transition-all hover:bg-white/10 hover:border-white/10">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Real-time Analytics</h3>
                <p className="text-sm text-slate-400">Monitor engagement and financial growth live.</p>
              </div>
            </div>

            <div className="group flex items-center gap-5 rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-md shadow-sm transition-all hover:bg-white/10 hover:border-white/10">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">User Management</h3>
                <p className="text-sm text-slate-400">Role-based access control for students and staff.</p>
              </div>
            </div>

            <div className="group flex items-center gap-5 rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-md shadow-sm transition-all hover:bg-white/10 hover:border-white/10">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Globe2 className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Global Reach</h3>
                <p className="text-sm text-slate-400">Manage courses and live sessions globally.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-500 font-medium tracking-widest uppercase opacity-60">
          <span>© 2026 Torii System</span>
          <span className="h-px w-12 bg-slate-700"></span>
          <span>Secure Enterprise Login</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-16 relative bg-background">
        <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-base zen-text-muted">Enter your credentials to access the admin portal.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="zen-text-muted text-xs uppercase tracking-wider font-bold ml-1">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@company.com"
                        {...field}
                        className="h-12 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all pl-4"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                      <FormLabel className="zen-text-muted text-xs uppercase tracking-wider font-bold">Password</FormLabel>
                      <Button variant="link" className="p-0 h-auto font-medium text-xs text-primary/80 hover:text-primary" type="button">Forgot password?</Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-12 pr-12 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all pl-4"
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 w-10 px-0 hover:bg-transparent text-muted-foreground/50 hover:text-foreground transition-colors"
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
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-3 pt-2 ml-1">
                <Checkbox id="remember" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30 rounded-md size-5" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none text-muted-foreground cursor-pointer select-none">Remember for 30 days</Label>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <ShieldCheck className="size-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold text-base mt-4" disabled={loading}>
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
          </Form>

          <p className="px-8 text-center text-xs text-muted-foreground/60 leading-relaxed">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
