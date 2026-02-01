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
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
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
      await dispatch(login(data)).unwrap();

      // Refresh auth state to get full permissions/profile
      const fullUser = await dispatch(checkAuth()).unwrap();

      // Block learner role
      if (fullUser.role === 'learner') {
        dispatch(setError('Học viên không thể truy cập bảng quản trị.'));
        toast.error('Từ chối truy cập: Cổng quản trị bị hạn chế.');
        return;
      }

      toast.success(`Chào mừng trở lại, ${fullUser.displayName || 'Quản trị viên'}`);
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
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Xác thực thất bại');
      toast.error(errorMessage);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Left Panel: Hero / Brand - Zen UI Pro */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/5 flex-col justify-between p-16 border-r border-border/50">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 opacity-40" />

        {/* Header Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 group">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 10h18" strokeLinecap="round" />
                <path d="M5 10v8" strokeLinecap="round" />
                <path d="M19 10v8" strokeLinecap="round" />
                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Torii <span className="text-primary not-italic">Admin</span></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">Management Matrix</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-xl space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="size-3" />
              Zen OS v4.0
            </div>
            <h1 className="text-6xl font-black tracking-tight text-foreground leading-[0.9] uppercase italic">
              Quản lý <br />
              <span className="text-primary not-italic">Hệ sinh thái</span> <br />
              <span className="text-foreground/20">Giáo dục</span>
            </h1>
            <p className="text-base font-bold text-muted-foreground/40 leading-relaxed max-w-md">
              Hệ thống vận hành Torii Academy được tối ưu hóa cho hiệu suất cao, bảo mật tuyệt đối và trải nghiệm quản trị mượt mà.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.2em]">
            <span>© 2026 TORII HOLDINGS</span>
            <div className="h-px w-8 bg-border/10"></div>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3" />
              SECURE ACCESS NODE
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form - Zen UI Pro */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-24 relative bg-background">
        <div className="w-full max-w-[420px] space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">Chào mừng <br /><span className="text-primary not-italic">Trở lại</span></h2>
            <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Xác thực quyền truy cập hệ thống</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="admin@torii.academy"
                        className="h-12 pl-12 rounded-xl border-border bg-background hover:border-primary/50 focus-visible:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/30 shadow-sm"
                        autoComplete="email"
                        type="email"
                      />
                      {fieldState.invalid && <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1 uppercase tracking-tight italic">{fieldState.error?.message}</p>}
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
                      <label htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        Khóa bảo mật
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors italic"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        className="h-12 pl-12 pr-12 rounded-xl border-border bg-background hover:border-primary/50 focus-visible:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/30 shadow-sm"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-10 hover:bg-primary/5 rounded-xl text-muted-foreground/40 hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      {fieldState.invalid && <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1 uppercase tracking-tight italic">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 px-1">
                <Checkbox
                  id="remember"
                  className="rounded-lg size-5 border-border bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all shadow-sm"
                />
                <label htmlFor="remember" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/30 cursor-pointer select-none hover:text-primary transition-colors leading-none">Duy trì phiên đăng nhập 30 ngày</label>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-4 flex items-center gap-4 animate-in fade-in zoom-in-95">
                  <div className="size-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <p className="text-[11px] font-black text-rose-600 uppercase tracking-tight leading-none italic">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all duration-500 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 size-4 animate-spin opacity-50" />
                    ĐANG XÁC THỰC...
                  </>
                ) : (
                  <>
                    ĐĂNG NHẬP HỆ THỐNG
                    <ArrowRight className="ml-3 size-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="pt-8 text-center text-muted-foreground/10 italic">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">
              Access restricted to authorized personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
