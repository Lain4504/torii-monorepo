import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export function PasswordTab() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (_data: PasswordForm) => {
        setIsLoading(true);
        try {
            // TODO: Implement password change API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Password changed successfully');
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <KeyRound className="size-5 text-primary" />
                                <h3 className="text-lg font-serif font-medium text-foreground">
                                    Change Password
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60">
                                Update your password to keep your account secure
                            </p>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">
                                    Password Security Tips
                                </p>
                                <ul className="space-y-1 text-xs text-muted-foreground/60">
                                    <li>• Use at least 8 characters</li>
                                    <li>• Include uppercase and lowercase letters</li>
                                    <li>• Add numbers and special characters</li>
                                    <li>• Avoid common words or personal information</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Current Password */}
                        <Controller
                            name="currentPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                        <Input
                                            {...field}
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Enter current password"
                                            className="pl-10 pr-12 rounded-lg"
                                            autoComplete="current-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs text-rose-500">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />

                        {/* New Password */}
                        <Controller
                            name="newPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                        <Input
                                            {...field}
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            className="pl-10 pr-12 rounded-lg"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs text-rose-500">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Confirm Password */}
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                        <Input
                                            {...field}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            className="pl-10 pr-12 rounded-lg"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs text-rose-500">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full gap-2 rounded-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="size-4" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
