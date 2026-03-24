'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'

type GuestActionGuardProps = {
    children: React.ReactNode
}

export function GuestActionGuard({ children }: GuestActionGuardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [redirecting, setRedirecting] = useState(false)

    const redirectToLogin = () => {
        if (redirecting) return
        setRedirecting(true)
        const from = pathname || '/dashboard'
        router.push(`/login?from=${encodeURIComponent(from)}`)
    }

    useEffect(() => {
        if (!open) return
        const timer = setTimeout(() => {
            redirectToLogin()
        }, 900)
        return () => clearTimeout(timer)
    }, [open])

    const handleActionAttempt = (
        e: React.MouseEvent<HTMLDivElement> | React.FormEvent<HTMLDivElement>
    ) => {
        const target = e.target as HTMLElement | null
        if (!target) return

        if (target.closest('a[href]')) return
        if (target.closest('[data-guest-allow="true"]')) return

        const blockedElement = target.closest(
            'button, [role="button"], input, textarea, select, [contenteditable="true"], form, [data-requires-auth="true"]'
        )

        if (!blockedElement) return

        e.preventDefault()
        e.stopPropagation()
        setOpen(true)
    }

    return (
        <>
            <div onClickCapture={handleActionAttempt} onSubmitCapture={handleActionAttempt}>
                {children}
            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tinh nang nay can dang nhap</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ban dang o che do xem truoc. Vui long dang nhap de tiep tuc su dung tinh nang nay.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={redirectToLogin}>
                            Dang nhap ngay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
