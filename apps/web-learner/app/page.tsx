"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, Sparkles, GraduationCap, Zap, Globe, Cpu } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false)
  
  // Mouse tracking for interactive glow
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    setIsMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  if (!isMounted) return null

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-zinc-950 overflow-hidden flex flex-col items-center justify-center p-6 selection:bg-primary/20">
      
      {/* ─── Background Effects — Antigravity Style ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Colorful flare specks (Top Left) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[5%] left-[5%] w-1 h-1 bg-red-400 rounded-full blur-[2px] opacity-40" />
          <div className="absolute top-[8%] left-[12%] w-1.5 h-1.5 bg-yellow-400 rounded-full blur-[2px] opacity-40" />
          <div className="absolute top-[12%] left-[6%] w-1 h-1 bg-blue-400 rounded-full blur-[2px] opacity-40" />
          <div className="absolute top-[18%] left-[15%] w-2 h-2 bg-green-400 rounded-full blur-[3px] opacity-30" />
          <div className="absolute top-[4%] left-[20%] w-1.5 h-1.5 bg-purple-400 rounded-full blur-[2px] opacity-30" />
          
          {/* Subtle colorful gradients in corners */}
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[50%] blur-3xl opacity-50" 
            style={{ background: 'radial-gradient(circle at center, rgba(96, 165, 250, 0.15), transparent 70%)' }} />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[50%] blur-3xl opacity-50" 
            style={{ background: 'radial-gradient(circle at center, rgba(251, 146, 60, 0.15), transparent 70%)' }} />
        </div>

        {/* Interactive Mouse Glow */}
        <motion.div
          style={{
            left: springX,
            top: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] mix-blend-soft-light opacity-0 sm:opacity-100"
        />
        
        {/* Dot Pattern Grid */}
        <div 
          className="absolute inset-0 opacity-[0.25]" 
          style={{ 
            backgroundImage: "radial-gradient(#e0e0e0 1px, transparent 0)", 
            backgroundSize: "28px 28px" 
          }} 
        />
      </div>

      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Header / Logo */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
           className="mb-12 flex items-center gap-3 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 bg-white/30 dark:bg-black/30 shadow-sm"
        >
          <Image
            src="/logo_dark.png"
            alt="Torii Logo"
            width={32}
            height={32}
            className="h-7 w-auto object-contain"
          />
          <span className="font-space font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Torii Learner</span>
        </motion.div>

        {/* Hero Headline Section */}
        <div className="flex flex-col gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <h1 className="text-4xl sm:text-6xl md:text-[5.5rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-space leading-[1.05]">
              Experience mastery with <br />
              <span className="relative inline-block text-primary">
                next-generation learning
                <motion.div 
                  className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary/20 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                />
              </span>
            </h1>
          </motion.div>

          {/* Subheadline with Animated Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col gap-4 items-center"
          >
            <p className="text-lg sm:text-2xl text-zinc-500 dark:text-zinc-400 font-sans max-w-3xl leading-relaxed">
              Vào không gian tri thức để khởi đầu tương lai. <br className="hidden sm:block" />
              Tại Torii, chúng tôi kết hợp trí tuệ nhân tạo và thiết kế học thuật để mang lại đột phá.
            </p>
          </motion.div>
        </div>

        {/* Interactive CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          {/* Main CTA - Elevated Style */}
          <Button asChild size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl group relative overflow-hidden transition-all duration-500 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 relative z-10">
              Vào Không Gian Học Tập
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
            </Link>
          </Button>

          {/* Secondary CTA - Glassmorphic Style */}
          <Button variant="outline" size="lg" className="h-16 px-10 text-xl font-medium rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-2">
            <Link href="/courses" className="flex items-center gap-2">
              Khám Phá Khóa Học
            </Link>
          </Button>
        </motion.div>

        {/* Feature Icons Grid - Minimalist approach */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="mt-32 grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700 select-none pb-20"
        >
          {[
            { icon: <Cpu className="w-6 h-6" />, label: "AI Powered" },
            { icon: <Zap className="w-6 h-6" />, label: "Fast & Smooth" },
            { icon: <Globe className="w-6 h-6" />, label: "Global Standard" },
            { icon: <GraduationCap className="w-6 h-6" />, label: "Expert Guided" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                {item.icon}
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase font-space">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Floating Sparkles - Extra Polish */}
      <div className="absolute top-[30%] left-[20%] text-primary opacity-20 hidden sm:block">
        <Sparkles className="h-10 w-10 animate-pulse duration-[5s]" />
      </div>
      <div className="absolute bottom-[40%] right-[15%] text-blue-500 opacity-20 hidden sm:block">
        <Sparkles className="h-8 w-8 animate-pulse duration-[7s]" />
      </div>

      {/* Footer / Info (Optional, kept minimal) */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 w-full text-center text-xs text-zinc-400 font-sans tracking-wide"
      >
        Designed for Excellence • Torii Monorepo 2026
      </motion.footer>
    </div>
  )
}
