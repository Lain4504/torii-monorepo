"use client";

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { login, checkAuth } from '@/store/slices/authSlice';
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
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
    const dispatch = useAppDispatch();
    const router = useRouter(); // Web Learner uses next/navigation
    const { status, error } = useAppSelector((state) => state.auth);
    const isLoading = status === 'loading';
    const [showPassword, setShowPassword] = useState(false);

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
                // Ensure auth state is fully updated (checkAuth might be redundant if login returns user but good to confirm)
                await dispatch(checkAuth());

                toast.success('Login successful', {
                    description: 'Welcome back!',
                });
                router.push('/');
                router.refresh(); // Ensure Payload/Middleware re-runs
            } else {
                toast.error("Login failed", {
                    description: typeof resultAction.payload === 'string' ? resultAction.payload : 'Invalid credentials',
                });
            }
        } catch (err) {
            console.error("Login error", err);
        }
    };

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <FieldContent>
                                    <Input placeholder="learner@torii.jp" {...field} />
                                </FieldContent>
                                <FieldError errors={[{ message: fieldState.error?.message }]} />
                            </Field>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Password</FieldLabel>
                                <FieldContent>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="********"
                                            {...field}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </FieldContent>
                                <FieldError errors={[{ message: fieldState.error?.message }]} />
                            </Field>
                        )}
                    />

                    {error && (
                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        Sign In
                    </Button>
                </form>
            </Form>
        </div>
    );
}
