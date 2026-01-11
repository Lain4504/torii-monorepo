"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-3xl group-[.toaster]:text-foreground group-[.toaster]:border-border/20 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-3xl group-[.toaster]:p-5 group-[.toaster]:gap-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[11px] group-[.toast]:font-semibold group-[.toast]:uppercase group-[.toast]:tracking-wider group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:rounded-xl group-[.toast]:h-9 group-[.toast]:px-4 group-[.toast]:text-[10px] group-[.toast]:shadow-lg group-[.toast]:shadow-primary/20",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:rounded-xl group-[.toast]:h-9 group-[.toast]:px-4 group-[.toast]:text-[10px]",
          title: "group-[.toast]:text-sm group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-wide group-[.toast]:mb-1",
          error: "group-[.toaster]:border-destructive/20 group-[.toaster]:bg-destructive/5 group-[.toaster]:text-destructive",
          success: "group-[.toaster]:border-emerald-500/20 group-[.toaster]:bg-emerald-500/5 group-[.toaster]:text-emerald-500",
          warning: "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-500/5 group-[.toaster]:text-amber-500",
          info: "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-500/5 group-[.toaster]:text-blue-500",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-500" />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 animate-spin text-muted-foreground" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
