import { useState, useEffect } from 'react'
import { enrollmentApi } from '@/apis/services/enrollment-api'
import { wishlistApi } from '@/apis/services/wishlist-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'
import { useRouter } from 'next/navigation'
import { type EnrollmentResponseDTO, EnrollmentStatus } from '@workspace/schemas'

export function useCourseEnrollment(courseId: string, courseSlug: string) {
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [isExpired, setIsExpired] = useState(false)
    const [enrollment, setEnrollment] = useState<EnrollmentResponseDTO | null>(null)
    const [hasNewerVersion, setHasNewerVersion] = useState(false)
    const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
    const [isLoadingEnrollment, setIsLoadingEnrollment] = useState(false)
    const [isToggling, setIsToggling] = useState(false)
    const [isEnrolling, setIsEnrolling] = useState(false)

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const user = useAppSelector((state) => state.auth.user)
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated && user?.id && courseId) {
            checkWishlistStatus()
            checkEnrollmentStatus()
        }
    }, [isAuthenticated, user?.id, courseId])

    const checkWishlistStatus = async () => {
        try {
            setIsLoadingWishlist(true)
            const result = await wishlistApi.checkWishlist(courseId)
            setIsInWishlist(result.isInWishlist)
        } catch (error) {
            console.error('Failed to check wishlist status:', error)
        } finally {
            setIsLoadingWishlist(false)
        }
    }

    const checkEnrollmentStatus = async () => {
        try {
            setIsLoadingEnrollment(true)
            const result = await enrollmentApi.checkEnrollment(courseId)
            setIsEnrolled(result.isEnrolled)
            if (result.enrollment) {
                setEnrollment(result.enrollment)
                // Check if expired
                if (result.enrollment.expiresAt) {
                    const expiresAt = new Date(result.enrollment.expiresAt)
                    setIsExpired(expiresAt < new Date() || result.enrollment.completionStatus === EnrollmentStatus.EXPIRED)
                } else if (result.enrollment.completionStatus === EnrollmentStatus.EXPIRED) {
                    setIsExpired(true)
                } else {
                    setIsExpired(false)
                }
            }
            if (result.hasNewerVersion) {
                setHasNewerVersion(result.hasNewerVersion)
            }
        } catch (error) {
            console.error('Failed to check enrollment status:', error)
        } finally {
            setIsLoadingEnrollment(false)
        }
    }

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
            router.push('/login')
            return
        }

        try {
            setIsToggling(true)
            const result = await wishlistApi.toggleWishlist(courseId)
            setIsInWishlist(result.isInWishlist)
            toast.success(result.isInWishlist ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
        } catch (error: any) {
            console.error('Failed to toggle wishlist:', error)
            toast.error(error?.response?.data?.message || 'Không thể cập nhật yêu thích')
        } finally {
            setIsToggling(false)
        }
    }

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đăng ký khóa học')
            router.push('/login')
            return
        }

        try {
            setIsEnrolling(true)
            const newEnrollment = await enrollmentApi.createEnrollment({ courseId })
            setIsEnrolled(true)
            setIsExpired(false)
            setEnrollment(newEnrollment)
            toast.success('Đã đăng ký khóa học thành công!')
            router.push(`/courses/${courseSlug}/learn`)
        } catch (error: any) {
            console.error('Failed to enroll:', error)
            toast.error(error?.response?.data?.message || 'Không thể đăng ký khóa học')
        } finally {
            setIsEnrolling(false)
        }
    }

    return {
        isInWishlist,
        isEnrolled,
        isExpired,
        enrollment,
        hasNewerVersion,
        isLoadingWishlist,
        isLoadingEnrollment,
        isToggling,
        isEnrolling,
        isAuthenticated,
        handleToggleWishlist,
        handleEnroll
    }
}
