"use client";

import { useEffect, useState } from 'react';
import { useMarkToastShown, useStreak } from '@/lib/api/services/gamification-api';
import { Dialog, DialogContent, DialogTitle } from '@workspace/ui/components/dialog';
import { motion } from 'framer-motion';
import { Flame, Snowflake, Sparkles, Trophy, Target, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

type StreakWelcomeModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function StreakWelcomeModal(props: StreakWelcomeModalProps = {}) {
  const { data: streak } = useStreak();
  const markToastShown = useMarkToastShown();

  const isControlled =
    typeof props.open === 'boolean' && typeof props.onOpenChange === 'function';

  const [isOpen, setIsOpen] = useState(false);
  const [sessionShown, setSessionShown] = useState(false);

  useEffect(() => {
    if (!streak || sessionShown) return;

    const todayKey = `streak_welcome_shown_${new Date().toISOString().slice(0, 10)}`;
    const shownToday = typeof window !== 'undefined' && window.localStorage.getItem(todayKey) === '1';

    const shouldShow = streak.shouldShowToast === true && !shownToday;
    if (!shouldShow) return;

    const timer = setTimeout(() => {
      if (isControlled) {
        props.onOpenChange?.(true);
      } else {
        setIsOpen(true);
      }
      setSessionShown(true);
      try { window.localStorage.setItem(todayKey, '1'); } catch { }
      markToastShown.mutate();
    }, 600);

    return () => clearTimeout(timer);
  }, [streak, sessionShown, isControlled, props]);

  if (!streak) return null;

  const { currentStreak, freezeCount, isActiveToday, recentActiveDates } = streak as any;

  // Build 7-day calendar
  const buildCalendar = () => {
    const now = new Date();
    const vnToday = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const days = [];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(vnToday);
      date.setDate(vnToday.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const isToday = i === 0;

      let status: 'active' | 'completed' | 'inactive' = 'inactive';

      if (isToday && isActiveToday) {
        status = 'active';
      } else if (Array.isArray(recentActiveDates) && recentActiveDates.includes(dateStr)) {
        status = 'completed';
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
    <Dialog
      open={isControlled ? props.open : isOpen}
      onOpenChange={isControlled ? props.onOpenChange : setIsOpen}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden">
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
            stiffness: 300,
          }}
          className="relative"
        >
          {/* Gradient Blob Background */}


          {/* Main Card */}
          <div className="relative border-none bg-background p-6 sm:p-8">
            {/* Floating Sparkles */}
            <div className="animate-bounce absolute left-8 top-8">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="animation-delay-200 animate-bounce absolute right-16 top-12">
              <Sparkles className="h-4 w-4 text-primary/70" />
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Animated Icon & Title */}
              <div className="space-y-3 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: 'spring',
                    delay: 0.2,
                    duration: 0.8,
                  }}
                  className={cn(
                    'inline-flex h-20 w-20 items-center justify-center rounded-full',
                    currentStreak > 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="text-5xl"
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
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    {currentStreak > 0 ? `${currentStreak} ngày liên tiếp` : 'Bắt đầu streak hôm nay'}
                  </h2>

                  <p className="text-sm font-medium">
                    {currentStreak > 0 ? (
                      isActiveToday ? (
                        <span className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-emerald-500" />
                          Bạn đã check-in hôm nay!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2 text-primary">
                          <Target className="h-5 w-5" />
                          Hoàn thành 1 bài học để giữ streak
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground">
                        Hoàn thành 1 hoạt động học để bắt đầu
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

                <div className="relative rounded-xl border bg-muted/30 p-4">
                  <p className="mb-4 flex items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
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
                          type: 'spring',
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="text-xs font-bold text-muted-foreground">
                          {day.dayName}
                        </span>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={cn(
                            'relative flex h-11 w-11 items-center justify-center rounded-lg border transition-all duration-300',
                            day.status === 'active' && 'bg-primary border-primary text-primary-foreground',
                            day.status === 'completed' && 'bg-primary/20 border-primary/30 text-primary',
                            day.status === 'inactive' && 'bg-muted/50 border-border/50 text-muted-foreground',
                          )}
                        >
                          {day.status === 'active' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Flame className="h-6 w-6 text-white drop-shadow-lg" />
                            </motion.div>
                          )}
                          {day.status === 'completed' && (
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {day.isToday && (
                            <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
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
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                      <div className="rounded-md bg-primary/10 p-2 text-primary">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{currentStreak} ngày</p>
                        <p className="text-xs text-muted-foreground">Hiện tại</p>
                      </div>
                    </div>
                  )}

                  {freezeCount > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                      <div className="rounded-md bg-primary/10 p-2 text-primary">
                        <Snowflake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{freezeCount} lần</p>
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
                  className="h-11 w-full font-bold"
                >
                  {isActiveToday ? 'Tiếp tục học' : 'Bắt đầu học ngay'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

