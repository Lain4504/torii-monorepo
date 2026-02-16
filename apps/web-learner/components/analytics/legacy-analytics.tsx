"use client"

import * as React from "react"
import { BarChart, BookOpen, Clock, Trophy, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { learningProgressApi, LearningStats } from "@/apis/services/learning-progress-api"
import { ProgressChart } from "./progress-chart"

export function LegacyAnalytics() {
    const [stats, setStats] = React.useState<LearningStats | null>(null)
    const [chartData, setChartData] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, historyData] = await Promise.all([
                    learningProgressApi.getStats(),
                    learningProgressApi.getHistory()
                ])
                setStats(statsData)

                // Transform history for chart
                // Group by date, count lessons
                const historyMap = new Map<string, number>()
                historyData.forEach(item => {
                    const date = new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'short' })
                    historyMap.set(date, (historyMap.get(date) || 0) + 1)
                })

                // Create last 7 days chart data
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

                const data = []
                for (let i = 6; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    const dayName = days[d.getDay()] || 'Sun'
                    data.push({
                        date: dayName,
                        lessons: historyMap.get(dayName) || 0,
                        score: 0 // Legacy doesn't track score per day easily without AI
                    })
                }
                setChartData(data)

            } catch (error) {
                console.error("Failed to fetch legacy stats", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Statistics</h1>
                <p className="text-muted-foreground mt-1">Overview of your learning progress</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Trophy className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.completedCourses || 0}</div>
                        <p className="text-xs text-muted-foreground">Courses finished</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalLearningHours || 0}h</div>
                        <p className="text-xs text-muted-foreground">Total time spent</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                        <BarChart className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats?.averageProgress || 0)}%</div>
                        <p className="text-xs text-muted-foreground">Across all courses</p>
                    </CardContent>
                </Card>
            </div>

            <ProgressChart data={chartData} />
        </div>
    )
}
