import { Star, ThumbsUp } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'

export function CourseReviews() {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá từ học viên</h2>

            {/* Review Summary */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-w-[200px]">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white mb-2">4.8</span>
                    <div className="flex gap-1 text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                    </div>
                    <span className="text-sm text-slate-500">2,456 đánh giá</span>
                </div>

                <div className="flex-1 w-full space-y-2">
                    {[
                        { stars: 5, percent: 80 },
                        { stars: 4, percent: 15 },
                        { stars: 3, percent: 3 },
                        { stars: 2, percent: 1 },
                        { stars: 1, percent: 1 },
                    ].map((rating) => (
                        <div key={rating.stars} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-3">{rating.stars}</span>
                            <Star className="w-4 h-4 text-slate-400" />
                            <Progress value={rating.percent} className="h-2" />
                            <span className="text-sm text-slate-500 w-10 text-right">{rating.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                        <div className="flex gap-4">
                            <Avatar>
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Nguyễn Văn A</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-0.5 text-yellow-400">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-xs text-slate-500">• 2 ngày trước</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Khóa học rất chi tiết và dễ hiểu. Thích nhất là phần AI Sensei giúp sửa lỗi phát âm ngay lập tức.
                                    Sensei Yamada dạy rất nhiệt tình.
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 hover:text-teal-600 hover:bg-transparent transition-colors">
                                        <ThumbsUp className="w-3 h-3 mr-1" />
                                        Hữu ích (12)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="outline" className="w-full">Xem thêm đánh giá</Button>
        </div>
    )
}
