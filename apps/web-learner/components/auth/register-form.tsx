"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { register as registerAction, clearError } from '@/store/slices/authSlice';
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
import { z } from 'zod';
import { useEffect } from 'react';

// Registration schema - only email and password (no fullName)
const registerFormSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { status, error } = useAppSelector((state) => state.auth);
    const isLoading = status === 'loading';
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = data;

            const resultAction = await dispatch(registerAction(registrationData));

            if (registerAction.fulfilled.match(resultAction)) {
                form.reset();
                toast.success('Account created successfully!', {
                    description: 'Please check your email to verify your account.',
                    duration: 6000,
                });
                // Redirect to home page after successful registration
                router.push('/');
            } else {
                // Handle specific error messages from backend
                const errorMessage = typeof resultAction.payload === 'string'
                    ? resultAction.payload
                    : (resultAction.payload as any)?.message || 'Unable to create account';

                toast.error("Registration failed", {
                    description: errorMessage,
                });
            }
        } catch (err) {
            console.error("Registration error", err);
            toast.error("Registration failed", {
                description: "An unexpected error occurred",
            });
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
                                    <Input
                                        placeholder="learner@torii.jp"
                                        {...field}
                                        aria-label="Email address"
                                    />
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
                                            aria-label="Password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
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
                                <p className="text-xs text-muted-foreground mt-1">
                                    Must contain uppercase, lowercase, and number
                                </p>
                            </Field>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Confirm Password</FieldLabel>
                                <FieldContent>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="********"
                                            {...field}
                                            className="pr-10"
                                            aria-label="Confirm password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        >
                                            {showConfirmPassword ? (
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        Create Account
                    </Button>
                </form>
            </Form>
        </div>
    );
}
