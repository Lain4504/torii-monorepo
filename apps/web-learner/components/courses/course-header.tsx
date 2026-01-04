import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Globe, Award, Users } from 'lucide-react'

export function CourseHeader() {
    return (
        <div className="bg-slate-900 border-b border-slate-800 text-white py-12">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex gap-2">
                            <Badge className="bg-teal-500 hover:bg-teal-600 border-0">JLPT N5</Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">Sơ cấp</Badge>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            Tiếng Nhật Sơ Cấp N5: Khởi đầu vững chắc cho người mới bắt đầu
                        </h1>

                        <p className="text-lg text-slate-300">
                            Khóa học toàn diện giúp bạn nắm vững bảng chữ cái, 100 từ vựng cơ bản và các cấu trúc ngữ pháp N5 quan trọng nhất. Tự tin giao tiếp cơ bản sau 3 tháng.
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm text-slate-400 pt-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-teal-400" />
                                <span>5,234 học viên</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-400" />
                                <span>Cập nhật: T10/2025</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-teal-400" />
                                <span>Tiếng Việt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
