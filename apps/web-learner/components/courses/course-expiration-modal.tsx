'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Clock, RefreshCcw } from "lucide-react"

interface CourseExpirationModalProps {
    isOpen: boolean
    onClose: () => void
    courseTitle: string
    courseSlug: string
}

export function CourseExpirationModal({
    isOpen,
    onClose,
    courseTitle,
    courseSlug,
}: CourseExpirationModalProps) {
    const handleRenew = () => {
        window.location.href = `/courses/${courseSlug}`
        onClose()
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="rounded-2xl border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
                <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-center">
                        Khóa học đã hết hạn
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground text-center">
                        Quyền truy cập vào khóa học <span className="font-bold text-foreground">"{courseTitle}"</span> của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục xem nội dung bài học.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:flex-col gap-2 mt-4">
                    <AlertDialogAction
                        onClick={handleRenew}
                        className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold h-11 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Gia hạn khóa học ngay
                    </AlertDialogAction>
                    <AlertDialogCancel 
                        onClick={onClose}
                        className="w-full rounded-xl h-11 font-bold border-border hover:bg-muted transition-all"
                    >
                        Để sau
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
