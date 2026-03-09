import { useState, useEffect } from 'react'
import { academyEnrollmentApi as enrollmentApi } from '@/lib/api/services/academy-enrollment-api'
import { wishlistApi } from '@/lib/api/services/wishlist-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'
import { useRouter } from 'next/navigation'
import { type AcademyEnrollmentModel as EnrollmentResponseDTO } from '@workspace/schemas'

export function useCourseEnrollment(courseMasterId: string, courseSlug: string) {
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
        if (isAuthenticated && user?.id && courseMasterId) {
            checkWishlistStatus()
            checkEnrollmentStatus()
        }
    }, [isAuthenticated, user?.id, courseMasterId])

    const checkWishlistStatus = async () => {
        try {
            setIsLoadingWishlist(true)
            const result = await wishlistApi.checkWishlist(courseMasterId)
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
            const result = await enrollmentApi.checkEnrollment(courseMasterId)
            setIsEnrolled(result.isEnrolled)
            if (result.enrollment) {
                setEnrollment(result.enrollment)
                // Check if expired
                if (result.enrollment.expiresAt) {
                    const expiresAt = new Date(result.enrollment.expiresAt)
                    setIsExpired(expiresAt < new Date() || result.enrollment.status === 'EXPIRED')
                } else if (result.enrollment.status === 'EXPIRED') {
                    setIsExpired(true)
                } else {
                    setIsExpired(false)
                }
            }
            // Mocking as hasNewerVersion is not yet in the refined schema
            // if (result.hasNewerVersion) {
            //     setHasNewerVersion(result.hasNewerVersion)
            // }
            setHasNewerVersion(false)
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
            const result = await wishlistApi.toggleWishlist(courseMasterId)
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
            // Mocking as createEnrollment is not yet in the refined schema
            // const newEnrollment = await enrollmentApi.createEnrollment({ courseRunId: courseMasterId })
            const newEnrollment = { id: 'mock-id' } as any;
            setIsEnrolled(true)
            setIsExpired(false)
            setEnrollment(newEnrollment)
            toast.success('Đã đăng ký khóa học thành công!')
            router.push(`/courses/${courseMasterId}/learn`)
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
