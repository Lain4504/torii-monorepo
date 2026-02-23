import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Field,
    FieldGroup,
    FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/services/auth'

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const mutation = useMutation({
        mutationFn: (data: ResetPasswordFormValues) => authApi.resetPassword({
            token: token!,
            password: data.password,
        }),
        onSuccess: () => {
            navigate('/login')
        },
    })

    const onSubmit = (data: ResetPasswordFormValues) => {
        mutation.mutate(data)
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Đặt lại mật khẩu</CardTitle>
                    <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                />
                                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                            </Field>
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}