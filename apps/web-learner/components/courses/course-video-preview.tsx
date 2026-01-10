'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PlayCircle, X, Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface CourseVideoPreviewProps {
    thumbnailUrl?: string | null
    previewVideoUrl?: string | null
    title: string
}

export function CourseVideoPreview({ thumbnailUrl, previewVideoUrl, title }: CourseVideoPreviewProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)

    const videoRef = useRef<HTMLVideoElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            // Reset states on close
            setIsPlaying(false)
            setProgress(0)
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const togglePlay = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (!videoRef.current) return
        setCurrentTime(videoRef.current.currentTime)
        const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100
        setProgress(progressPercent)
    }

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return
        setDuration(videoRef.current.duration)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return
        const newTime = (Number(e.target.value) / 100) * duration
        videoRef.current.currentTime = newTime
        setProgress(Number(e.target.value))
    }

    const toggleMute = () => {
        if (!videoRef.current) return
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return
        const newVol = Number(e.target.value)
        videoRef.current.volume = newVol
        setVolume(newVol)
        setIsMuted(newVol === 0)
    }

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 3000)
    }

    const skip = (seconds: number) => {
        if (!videoRef.current) return
        videoRef.current.currentTime += seconds
    }

    if (!thumbnailUrl) return null

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="relative aspect-video rounded-lg overflow-hidden shadow-md border group cursor-pointer bg-black"
            >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <img
                    src={thumbnailUrl || undefined}
                    alt={title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                {previewVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-background/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-8 h-8 text-primary ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {isOpen && previewVideoUrl && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-5xl px-4 md:px-6">
                        {/* Header/Close Bar */}
                        <div className="absolute top-[-3rem] right-4 md:right-6 flex justify-between w-full md:w-auto items-center pointer-events-auto">
                            <h3 className="text-white font-medium text-lg drop-shadow-md md:hidden truncate max-w-[80%]">
                                {title}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div
                            className="bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group aspect-video"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => isPlaying && setShowControls(false)}
                        >
                            <video
                                ref={videoRef}
                                src={previewVideoUrl}
                                className="w-full h-full object-contain"
                                autoPlay
                                onClick={togglePlay}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                            />

                            {/* Centered Play Button (Visible when paused or initially) */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                                    </div>
                                </div>
                            )}

                            {/* Controls Overlay */}
                            <div
                                className={cn(
                                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pt-12 transition-opacity duration-300",
                                    showControls ? "opacity-100" : "opacity-0"
                                )}
                            >
                                {/* Progress Bar */}
                                <div className="relative w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer group/slider">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-primary rounded-full relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full scale-0 group-hover/slider:scale-100 transition-transform" />
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <button onClick={togglePlay} className="hover:text-primary transition-colors">
                                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button onClick={() => skip(-5)} className="hover:text-primary transition-colors p-1">
                                                <RotateCcw className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => skip(5)} className="hover:text-primary transition-colors p-1">
                                                <RotateCw className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 group/vol">
                                            <button onClick={toggleMute} className="hover:text-primary transition-colors">
                                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                            </button>
                                            <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 h-1 accent-primary cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <span className="text-sm font-medium font-mono">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-white/60 text-center mt-4 text-sm hidden md:block">
                            {title}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
