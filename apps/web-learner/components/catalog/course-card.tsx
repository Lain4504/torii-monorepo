import Link from "next/link"
import { Star, Users, PlayCircle, BookOpen } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

interface CourseCardProps {
    id: string
    title: string
    slug: string
    thumbnail: string
    level: string
    instructor: {
        name: string
        avatar: string
    }
    rating: number
    reviewCount: number
    students: number
    price: number
    originalPrice?: number
    totalLessons: number
    totalHours: number
    isLive?: boolean
}

export function CourseCard({
    title,
    slug,
    thumbnail,
    level,
    instructor,
    rating,
    reviewCount,
    students,
    price,
    originalPrice,
    totalLessons,
    totalHours,
    isLive,
}: CourseCardProps) {
    return (
        <Link href={`/courses/${slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 flex flex-col group">
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 hover:bg-white dark:bg-slate-900/90 dark:text-white backdrop-blur-sm shadow-sm">
                        {level}
                    </Badge>
                    {isLive && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white animate-pulse border-0">
                            LIVE
                        </Badge>
                    )}
                </div>

                <CardContent className="flex-1 p-5 space-y-3">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <span className="font-bold text-slate-900 dark:text-white">{rating}</span>
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span>({reviewCount})</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{students.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{totalLessons} bài</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>{totalHours} giờ</span>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={instructor.avatar} />
                            <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {instructor.name}
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-teal-600">
                                {price === 0 ? "Miễn phí" : price.toLocaleString() + "₫"}
                            </span>
                            {originalPrice && originalPrice > price && (
                                <span className="text-xs text-slate-400 line-through">
                                    {originalPrice.toLocaleString()}₫
                                </span>
                            )}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
