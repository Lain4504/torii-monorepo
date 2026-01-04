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
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-slate-950 flex-col justify-between p-12 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          {/* Torii Gate Abstract Shape/Image could go here, for now using gradients */}
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 text-white font-bold text-xl">T</div>
            <span className="text-xl font-bold tracking-tight text-white/90">Torii Admin</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1]">
            Command Center for <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Modern Education</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Streamline operations, manage courses, and monitor learner progress from one centralized, powerful dashboard.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md shadow-sm transition-transform hover:scale-[1.02]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-time Analytics</h3>
                <p className="text-xs text-slate-400">Monitor engagement and financial growth live.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md shadow-sm transition-transform hover:scale-[1.02]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">User Management</h3>
                <p className="text-xs text-slate-400">Role-based access control for students and staff.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md shadow-sm transition-transform hover:scale-[1.02]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                <Globe2 className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Global Reach</h3>
                <p className="text-xs text-slate-400">Manage courses and live sessions globally.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs text-slate-500 font-medium tracking-wide uppercase">
          <span>© 2026 Torii System</span>
          <span className="h-px w-8 bg-slate-700"></span>
          <span>Secure Enterprise Login</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12 relative bg-background">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the admin portal.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@company.com"
                        {...field}
                        className="h-11 bg-muted/30"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Button variant="link" className="p-0 h-auto font-normal text-xs" type="button">Forgot password?</Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-11 pr-10 bg-muted/30"
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full w-10 px-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4 text-muted-foreground" />
                          ) : (
                            <Eye className="size-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">Toggle password visibility</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">Remember for 30 days</Label>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <ShieldCheck className="size-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-11 shadow-md" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
