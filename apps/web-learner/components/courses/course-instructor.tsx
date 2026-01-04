import { Star, Users, PlayCircle, Award } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export function CourseInstructor() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Giảng viên</h2>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2776&auto=format&fit=crop"
                                alt="Instructor"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <div className="text-sm font-bold text-slate-900 dark:text-white">4.9</div>
                            <div className="text-sm text-slate-500">(2.5k)</div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                Yamada Yuki (山田 雪)
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                Giảng viên Cao cấp tại Torii Nihongo
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>15,000+ Học viên</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-slate-400" />
                                <span>12 Khóa học</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-slate-400" />
                                <span>N1 JLPT Certified</span>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Cô Yamada có hơn 10 năm kinh nghiệm giảng dạy tiếng Nhật cho người nước ngoài.
                            Phương pháp giảng dạy của cô tập trung vào việc sử dụng tiếng Nhật tự nhiên trong
                            giao tiếp và hiểu sâu văn hóa Nhật Bản. Cô hiện là trưởng bộ môn tiếng Nhật tại
                            Torii Nihongo và đã giúp hàng nghìn học viên đỗ JLPT.
                        </p>

                        <Button variant="outline" className="h-9">
                            Xem hồ sơ chi tiết
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
