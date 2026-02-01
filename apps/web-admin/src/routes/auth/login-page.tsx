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
      {/* Left Panel: Info */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/30 flex-col justify-between p-16 border-r border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 group">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg group-hover:scale-105 transition-transform duration-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-foreground">Torii <span className="text-primary">Admin</span></span>
              <span className="text-xs font-medium text-muted-foreground/60">Hệ Thống Quản Trị</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-xl space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              Phiên bản 4.0
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
              Quản lý hệ sinh thái <br />
              giáo dục toàn diện
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Hệ thống vận hành Torii Academy được tối ưu hóa cho hiệu suất cao, bảo mật tuyệt đối và trải nghiệm quản trị mượt mà.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground/40">
            <span>© 2026 TORII HOLDINGS</span>
            <div className="h-px w-8 bg-border/40"></div>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3" />
              Đăng nhập an toàn
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-24 relative bg-background">
        <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-3 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Chào mừng trở lại</h2>
            <p className="text-sm font-medium text-muted-foreground">Vui lòng đăng nhập để quản trị hệ thống</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2.5">
                    <label htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80 ml-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="admin@torii.academy"
                        className="h-12 pl-12 rounded-xl border-border bg-background transition-all text-sm font-medium placeholder:text-muted-foreground/20 shadow-none focus-visible:ring-primary/20"
                        autoComplete="email"
                        type="email"
                      />
                      {fieldState.invalid && <p className="text-xs font-medium text-rose-500 mt-2 ml-1">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between ml-1">
                      <label htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80">
                        Mật khẩu
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs font-semibold text-primary/60 hover:text-primary transition-colors"
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
                        className="h-12 pl-12 pr-12 rounded-xl border-border bg-background transition-all text-sm font-medium placeholder:text-muted-foreground/20 shadow-none focus-visible:ring-primary/20"
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
                      {fieldState.invalid && <p className="text-xs font-medium text-rose-500 mt-2 ml-1">{fieldState.error?.message}</p>}
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5 px-1">
                <Checkbox
                  id="remember"
                  className="rounded-md size-4 border-border bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all shadow-none"
                />
                <label htmlFor="remember" className="text-xs font-medium text-muted-foreground/60 cursor-pointer select-none hover:text-primary transition-colors">Duy trì đăng nhập 30 ngày</label>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="size-1.5 rounded-full bg-destructive shrink-0" />
                  <p className="text-xs font-semibold text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    Đăng nhập vào hệ thống
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="pt-8 text-center text-muted-foreground/30">
            <p className="text-[10px] font-medium uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
