import { useState, useEffect } from 'react'
import { ReviewItem } from './review-item'
import { reviewApi, ReviewResponse } from '@/lib/api/services/review-api'
import { MessageSquareOff } from 'lucide-react'
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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"

interface ReviewListProps {
    learnerId: string
}

export function ReviewList({ learnerId }: ReviewListProps) {
    const [reviews, setReviews] = useState<(ReviewResponse & { courseTitle?: string; courseSlug?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true)
            try {
                // Fetch all reviews (paginated, but we'll fetch a reasonable batch)
                // Since API doesn't filter by userId, we fetch recent reviews and filter client-side
                const response = await reviewApi.getAllReviews(1, 100) // Fetching 100 to increase chance of finding user's reviews

                // Client-side filtering for reviews written BY this learner
                const userReviews = (response?.data || []).filter(review => review.userId === learnerId)

                setReviews(userReviews)
            } catch (error) {
                console.error("Failed to fetch reviews", error)
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [learnerId])

    const handleDeleteRequest = (reviewId: string) => {
        setDeleteId(reviewId)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            await reviewApi.deleteReview(deleteId)
            setReviews(reviews.filter(r => r.id !== deleteId))
        } catch (error) {
            console.error("Failed to delete review", error)
            alert('Có lỗi xảy ra khi xóa đánh giá')
        } finally {
            setIsDeleteDialogOpen(false)
            setDeleteId(null)
        }
    }

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <Empty className="py-16">
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-slate-100">
                        <MessageSquareOff className="text-slate-400" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có đánh giá nào</EmptyTitle>
                    <EmptyDescription>
                        Học viên này chưa nhận được đánh giá nào từ giảng viên hoặc bạn học.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <>
            <div className="flex flex-col gap-6 w-full">
                {reviews.map((review) => (
                    <ReviewItem
                        key={review.id}
                        review={review}
                        onDelete={handleDeleteRequest}
                    />
                ))}
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa đánh giá?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Đánh giá của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
