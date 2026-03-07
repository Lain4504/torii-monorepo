import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

const Flashcard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative rounded-xl border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Flashcard.displayName = "Flashcard"

const FlashcardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
FlashcardHeader.displayName = "FlashcardHeader"

const FlashcardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
)
FlashcardContent.displayName = "FlashcardContent"

const FlashcardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
FlashcardFooter.displayName = "FlashcardFooter"

const FlashcardFront = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-2", className)} {...props} />
)
FlashcardFront.displayName = "FlashcardFront"

const FlashcardBack = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-2", className)} {...props} />
)
FlashcardBack.displayName = "FlashcardBack"

const FlashcardFurigana = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
)
FlashcardFurigana.displayName = "FlashcardFurigana"

const FlashcardExample = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm", className)} {...props} />
)
FlashcardExample.displayName = "FlashcardExample"

export {
  Flashcard,
  FlashcardHeader,
  FlashcardContent,
  FlashcardFooter,
  FlashcardFront,
  FlashcardBack,
  FlashcardFurigana,
  FlashcardExample,
}
