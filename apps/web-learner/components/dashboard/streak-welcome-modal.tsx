"use client";

import { useEffect, useState } from 'react';
import { useStreak } from '@/apis/services/gamification-api';
import { Dialog, DialogContent, DialogTitle } from '@workspace/ui/components/dialog';
import { motion } from 'framer-motion';
import { X, Flame, Snowflake, Sparkles, Trophy, Target } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

export function StreakWelcomeModal() {
  const { data: streak } = useStreak();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!streak || hasShown) return;

    // Show modal after 800ms delay for smooth entrance
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [streak, hasShown]);

  if (!streak) return null;

  const { currentStreak, isActiveToday, freezeCount, lastActiveDate } = streak;

  // Build 7-day calendar
  const buildCalendar = () => {
    const today = new Date();
    const days = [];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const isToday = i === 0;
      
      let status: 'active' | 'completed' | 'estimated' | 'inactive' = 'inactive';
      
      if (isToday && isActiveToday) {
        status = 'active';
      } else if (lastActiveDate && dateStr === lastActiveDate) {
        status = 'completed';
      } else if (currentStreak > 0 && i > 0 && i <= currentStreak) {
        status = 'estimated';
      }
      
      days.push({ 
        status, 
        isToday, 
        dayName: dayNames[adjustedDay],
        date: date.getDate()
      });
    }
    
    return days;
  };

  const calendar = buildCalendar();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0 gap-0 border-none bg-transparent shadow-none overflow-hidden">
        <DialogTitle className="sr-only">
          {currentStreak > 0 
            ? `Streak hiện tại: ${currentStreak} ngày` 
            : 'Bắt đầu hành trình học tập'}
        </DialogTitle>
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300 
          }}
          className="relative"
        >
          {/* Gradient Blob Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/30 to-primary/20 rounded-[2.5rem] blur-3xl opacity-30 animate-pulse" />
          
          {/* Main Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
            {/* Floating Sparkles */}
            <div className="absolute top-8 left-8 animate-bounce">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute top-12 right-16 animate-bounce animation-delay-200">
              <Sparkles className="h-4 w-4 text-primary/70" />
            </div>

            {/* Content */}
            <div className="space-y-8">
              {/* Animated Icon & Title */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ 
                    type: 'spring',
                    delay: 0.2,
                    duration: 0.8
                  }}
                  className={cn(
                    "inline-flex items-center justify-center w-28 h-28 rounded-full",
                    currentStreak > 0 
                      ? "bg-gradient-to-br from-primary/80 to-primary shadow-lg shadow-primary/50"
                      : "bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/50"
                  )}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="text-6xl"
                  >
                    {currentStreak > 0 ? (
                      isActiveToday ? '🔥' : '⚡'
                    ) : '🎯'}
                  </motion.div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    {currentStreak > 0 ? (
                      <>
                        {currentStreak} Ngày Streak!
                      </>
                    ) : (
                      'Bắt Đầu Hành Trình!'
                    )}
                  </h2>
                  
                  <p className="text-lg font-medium">
                    {currentStreak > 0 ? (
                      isActiveToday ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                          <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          Bạn đã check-in hôm nay!
                        </span>
                      ) : (
                        <span className="text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2">
                          <Target className="h-5 w-5" />
                          Hãy check-in để giữ streak
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground">
                        Hoàn thành bài học đầu tiên
                      </span>
                    )}
                  </p>
                </motion.div>
              </div>

              {/* 7-Day Calendar - Premium Design */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold uppercase tracking-widest text-center text-muted-foreground mb-4 flex items-center justify-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Lịch Sử 7 Ngày
                  </p>
                  
                  <div className="grid grid-cols-7 gap-3">
                    {calendar.map((day, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ 
                          delay: 0.6 + idx * 0.05,
                          type: 'spring'
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="text-xs font-bold text-muted-foreground">
                          {day.dayName}
                        </span>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={cn(
                            "relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
                            day.status === 'active' && "bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/50",
                            day.status === 'completed' && "bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-300 shadow-md shadow-emerald-500/30",
                            day.status === 'estimated' && "bg-gradient-to-br from-primary/30 to-primary/50 border-primary/30",
                            day.status === 'inactive' && "bg-gray-200/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                          )}
                        >
                          {day.status === 'active' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Flame className="h-7 w-7 text-white drop-shadow-lg" />
                            </motion.div>
                          )}
                          {day.status === 'completed' && (
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {day.status === 'estimated' && (
                            <div className="w-3 h-3 bg-primary rounded-full" />
                          )}
                          {day.isToday && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Stats Row */}
              {(freezeCount > 0 || currentStreak > 0) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border border-primary/30 dark:border-primary/50">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{currentStreak} ngày</p>
                        <p className="text-xs text-muted-foreground">Hiện tại</p>
                      </div>
                    </div>
                  )}
                  
                  {freezeCount > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="p-2 rounded-xl bg-blue-500/10">
                        <Snowflake className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{freezeCount} lần</p>
                        <p className="text-xs text-muted-foreground">Đóng băng</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={() => setIsOpen(false)}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 rounded-2xl"
                >
                  {isActiveToday ? '🚀 Tiếp Tục Học' : '💪 Bắt Đầu Học Ngay'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for Calendar icon
function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
