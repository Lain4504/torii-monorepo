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
import { Eye, EyeOff, Loader2, ShieldCheck, BarChart3, Users, Globe2, Sparkles, Activity, ArrowUpRight } from 'lucide-react';
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
    } catch (err: unknown) {
      // Error message already extracted by extractErrorMessage in auth-slice
      const errorMessage = typeof err === 'string' ? err : 'Authentication failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background antialiased selection:bg-primary/20 selection:text-primary">
      {/* Left Panel: Hero / Brand - Zen UI Pro */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-background flex-col justify-between p-16">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse pointer-events-none" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="flex size-12 items-center justify-center rounded-[1.25rem] bg-primary shadow-xl shadow-primary/20 text-white font-black text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-[12deg]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 10h18" strokeLinecap="round" />
                <path d="M5 10v8" strokeLinecap="round" />
                <path d="M19 10v8" strokeLinecap="round" />
                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tighter text-foreground italic leading-none">Torii <span className="text-primary not-italic text-sm">ADMIN</span></span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-2">Intelligence Gateway</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-xl space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="size-3" />
              Cognitive Matrix Active
            </div>
            <h1 className="text-7xl font-serif font-bold tracking-tighter leading-[0.85] text-foreground italic px-1">
              Command <br />
              <span className="text-primary not-italic text-6xl">The Future</span>
            </h1>
            <p className="text-[13px] font-bold text-muted-foreground/40 leading-relaxed max-w-md italic border-l-2 border-primary/20 pl-8 uppercase tracking-widest px-1">
              "Master the architecture of knowledge. Nurture the learning journey with absolute clarity and focus."
            </p>
          </div>

          {/* Metric Cards - Zen Style */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group p-6 rounded-[2rem] bg-background/40 backdrop-blur-3xl border border-border/20 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                  <BarChart3 className="size-5" />
                </div>
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Pulse Sync</h3>
              <p className="text-2xl font-serif font-bold italic text-primary">OPTIMAL</p>
            </div>

            <div className="group p-6 rounded-[2rem] bg-background/40 backdrop-blur-3xl border border-border/20 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                  <Users className="size-5" />
                </div>
                <div className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">+12k</div>
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Entity Load</h3>
              <p className="text-2xl font-serif font-bold italic text-foreground">BALANCED</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center gap-8 text-[10px] font-black text-muted-foreground/20 tracking-[0.3em] uppercase italic">
          <span>© 2026 TORII HQ</span>
          <div className="h-px flex-1 bg-border/10"></div>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3" />
            PROTOCOL SECURE
          </span>
        </div>
      </div>

      {/* Right Panel: Login Form - Zen UI Pro */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-16 relative bg-background overflow-hidden">
        {/* Subtle background glow for form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[440px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/20 text-muted-foreground/40 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-2">
              Identity Protocol Verification
            </div>
            <h2 className="text-5xl font-serif font-bold tracking-tighter text-foreground italic px-1">Access <br /><span className="text-primary not-italic text-4xl">Registry</span></h2>
            <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] italic ml-1">Establish secure uplink with Torii Core.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2 group">
                    <label htmlFor={field.name} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-focus-within:text-primary transition-colors ml-1">
                      <Globe2 className="size-3" />
                      Digital Signature
                    </label>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="IDENTIFIER@TORII.HQ"
                        className="h-16 px-6 rounded-[1.5rem] border-border/15 bg-muted/10 hover:bg-muted/20 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-sm font-black uppercase tracking-[0.1em] placeholder:text-muted-foreground/10"
                        autoComplete="email"
                        type="email"
                      />
                      {fieldState.invalid && <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-2 ml-4 italic">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between ml-1 px-1">
                      <label htmlFor={field.name} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                        <ShieldCheck className="size-3" />
                        Access Key
                      </label>
                      <button type="button" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-colors italic">LOST KEY?</button>
                    </div>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="h-16 pl-6 pr-14 rounded-[1.5rem] border-border/15 bg-muted/10 hover:bg-muted/20 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-sm font-black tracking-widest placeholder:text-muted-foreground/10"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2 size-10 hover:bg-primary/10 text-muted-foreground/20 hover:text-primary transition-colors rounded-xl"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      {fieldState.invalid && <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-2 ml-4 italic">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex items-center gap-4 px-2">
              <Checkbox id="remember" className="rounded-md size-4 border-border/20 data-[state=checked]:bg-primary" />
              <label htmlFor="remember" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 cursor-pointer select-none hover:text-foreground transition-colors italic">Maintain Temporal Session</label>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 p-5 flex items-center gap-4 animate-in fade-in zoom-in-95">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                  <Activity className="size-4" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 leading-relaxed italic">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all duration-500 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 size-4 animate-spin opacity-50" />
                  Calibrating Matrix...
                </>
              ) : (
                <>
                  Establish Uplink
                  <ArrowUpRight className="ml-3 size-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </>
              )}
            </Button>
          </form>

          <p className="px-8 text-center text-[9px] font-bold text-muted-foreground/20 leading-relaxed uppercase tracking-[0.1em]">
            By initiating access, you comply with the{" "}
            <a href="#" className="text-muted-foreground/40 hover:text-primary transition-colors font-black">Security Protocols</a>{" "}
            and{" "}
            <a href="#" className="text-muted-foreground/40 hover:text-primary transition-colors font-black">Privacy Manifest</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
