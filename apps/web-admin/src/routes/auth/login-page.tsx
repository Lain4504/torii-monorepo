import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { login, checkAuth, selectAuthError, selectAuthLoading, setError } from '@/store/slices/auth-slice.ts';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/20 p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Torii Admin</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Vui lòng nhập thông tin để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-6">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Địa chỉ Email</Label>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="admin@torii.academy"
                        type="email"
                        autoComplete="email"
                        required
                      />
                      {fieldState.invalid && <p className="text-xs text-destructive">{fieldState.error?.message}</p>}
                    </div>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor={field.name}>Mật khẩu</Label>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          {...field}
                          id={field.name}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </div>
                      {fieldState.invalid && <p className="text-xs text-destructive">{fieldState.error?.message}</p>}
                    </div>
                  )}
                />

                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="font-normal text-muted-foreground">Duy trì đăng nhập</Label>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/15 text-destructive p-3 text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Đăng nhập
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground">
            © 2026 TORII HOLDINGS
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
