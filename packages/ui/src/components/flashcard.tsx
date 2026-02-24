import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const flashcardVariants = cva(
    "group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md overflow-hidden",
    {
        variants: {
            variant: {
                default: "border-border",
                outline: "border-2 border-border",
                ghost: "border-none shadow-none bg-transparent hover:bg-muted/50",
            },
            size: {
                default: "p-6 min-h-[160px]",
                sm: "p-4 min-h-[120px]",
                lg: "p-8 min-h-[200px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface FlashcardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flashcardVariants> { }

const Flashcard = React.forwardRef<HTMLDivElement, FlashcardProps>(
    ({ className, variant, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(flashcardVariants({ variant, size, className }))}
            {...props}
        />
    )
)
Flashcard.displayName = "Flashcard"

const FlashcardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center justify-between mb-2", className)}
        {...props}
    />
))
FlashcardHeader.displayName = "FlashcardHeader"

const FlashcardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col flex-1", className)}
        {...props}
    />
))
FlashcardContent.displayName = "FlashcardContent"

const FlashcardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-4 flex items-center justify-end gap-2", className)}
        {...props}
    />
))
FlashcardFooter.displayName = "FlashcardFooter"

const FlashcardFront = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-2xl font-bold tracking-tight text-foreground", className)}
        {...props}
    />
))
FlashcardFront.displayName = "FlashcardFront"

const FlashcardBack = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-2 text-base text-muted-foreground", className)}
        {...props}
    />
))
FlashcardBack.displayName = "FlashcardBack"

const FlashcardFurigana = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-xs font-medium text-primary/60 mb-1", className)}
        {...props}
    />
))
FlashcardFurigana.displayName = "FlashcardFurigana"

const FlashcardExample = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-3 pt-3 border-t border-border/50 text-sm italic text-muted-foreground/80", className)}
        {...props}
    />
))
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
