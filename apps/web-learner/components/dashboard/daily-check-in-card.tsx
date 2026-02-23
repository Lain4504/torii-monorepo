"use client";

import { motion } from "framer-motion";
import { Flame, Snowflake, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { useStreak } from "@/lib/api/services/gamification-api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useRouter } from "next/navigation";

export function DailyCheckInCard() {
  const { data: streak, isLoading, isError } = useStreak({ enableCelebrations: true });
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !streak) {
    return null; // Silently hide if error
  }

  const { currentStreak, freezeCount, isActiveToday, willBreakTomorrow } = streak;

  // Generate 7-day Smart Calendar with confirmed/estimated states
  const calendar = generateWeekCalendar(currentStreak, streak.lastActiveDate, isActiveToday);

  const handleStartLearning = () => {
    // Navigate to my courses to encourage learning activity
    router.push('/dashboard/my-courses');
  };

  return (
    <Card className={cn(
      "border-border/50 transition-all duration-300",
      isActiveToday && "bg-gradient-to-br from-orange-500/5 to-red-500/5"
    )}>
      <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                    <Flame className={cn(
                        "size-5",
                        currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
                    )} />
                    <span className="font-semibold">
                        {currentStreak > 0 ? `${currentStreak} Day Streak` : "Start Your Streak"}
                    </span>
                </div>
                {currentStreak > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-orange-500"
                    >
                        🔥
                    </motion.div>
                )}
            </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warning Banner */}
        {willBreakTomorrow && !isActiveToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 text-xs text-yellow-600 dark:text-yellow-500"
          >
            ⚠️ Complete a lesson today to keep your {currentStreak}-day streak!
          </motion.div>
        )}

        {/* 7-Day Smart Calendar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              Last 7 Days
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendar.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted-foreground font-medium">
                  {day.label}
                </span>
                <div
                  className={cn(
                    "w-full aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                    // Confirmed active (today or lastActiveDate)
                    day.status === 'confirmed' &&
                      "bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 shadow-lg shadow-orange-500/20",
                    // Estimated based on streak
                    day.status === 'estimated' &&
                      "bg-gradient-to-br from-orange-400/40 to-red-400/40 border-orange-300/50",
                    // Inactive or unknown
                    day.status === 'inactive' && (
                      day.isToday
                        ? "border-primary border-dashed bg-primary/5"
                        : "border-border/50 bg-muted/30"
                    )
                  )}
                  title={
                    day.status === 'confirmed' 
                      ? `Active on ${day.date}` 
                      : day.status === 'estimated'
                        ? `Estimated (based on ${currentStreak}-day streak)`
                        : 'Not active'
                  }
                >
                  {day.status === 'confirmed' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white text-lg font-bold"
                    >
                      ✓
                    </motion.span>
                  )}
                  {day.status === 'estimated' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-orange-600 dark:text-orange-400 text-sm font-bold"
                    >
                      ≈
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartLearning}
          disabled={isActiveToday}
          className={cn(
            "w-full transition-all duration-300",
            isActiveToday
              ? "bg-green-500/20 text-green-600 hover:bg-green-500/30 dark:text-green-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
          )}
          size="lg"
        >
          {isActiveToday ? (
            <>
              <span className="mr-2">✓</span>
              Active Today!
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Start Learning
            </>
          )}
        </Button>

        {!isActiveToday && (
          <p className="text-xs text-center text-muted-foreground">
            Complete any lesson or quiz to check in today
          </p>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          {/* Freeze Count */}
          {freezeCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Snowflake className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Freezes</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {freezeCount}
                </p>
              </div>
            </div>
          )}

          {/* Longest Streak */}
          {streak.longestStreak > 0 && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              freezeCount === 0 && "col-span-2"
            )}>
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="font-semibold text-purple-600 dark:text-purple-400">
                  {streak.longestStreak} days
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate Smart Calendar with estimated days
function generateWeekCalendar(
  currentStreak: number,
  lastActiveDate: string | null,
  isActiveToday: boolean
) {
  const today = new Date();
  const calendar = [];
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dateStr = date.toISOString().split("T")[0];
    const isToday = i === 0;
    
    // Determine status: confirmed, estimated, or inactive
    let status: 'confirmed' | 'estimated' | 'inactive' = 'inactive';
    
    // Confirmed: Today (if active)
    if (isToday && isActiveToday) {
      status = 'confirmed';
    }
    // Confirmed: Last active date
    else if (lastActiveDate && dateStr === lastActiveDate) {
      status = 'confirmed';
    }
    // Estimated: Within current streak range
    else if (currentStreak > 0) {
      // Calculate how many days ago this was
      const daysAgo = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // If this day falls within the streak window, mark as estimated
      // Account for whether today is active or not
      const effectiveStreakDays = isActiveToday ? currentStreak - 1 : currentStreak;
      
      if (daysAgo > 0 && daysAgo <= effectiveStreakDays && daysAgo <= 6) {
        status = 'estimated';
      }
    }

    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Make Monday = 0

    calendar.push({
      label: dayLabels[adjustedDay] || "?",
      status,
      isToday,
      date: dateStr,
    });
  }

  return calendar;
}
