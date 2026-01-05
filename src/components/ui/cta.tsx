import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ctaVariants = cva(
    "w-full rounded-lg overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6",
                centered: "bg-muted text-foreground p-8 md:p-12 flex flex-col items-center text-center gap-6",
                simple: "bg-background border text-foreground p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4",
                outline: "bg-transparent border-2 border-primary text-foreground p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface CTAProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ctaVariants> {
    heading: string
    description?: string
    primaryAction: {
        text: string
        href: string
    }
    secondaryAction?: {
        text: string
        href: string
    }
}

const CallToAction = React.forwardRef<HTMLDivElement, CTAProps>(
    ({ className, variant, heading, description, primaryAction, secondaryAction, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(ctaVariants({ variant, className }))}
                {...props}
            >
                <div className="flex flex-col gap-2 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {heading}
                    </h2>
                    {description && (
                        <p className={cn(
                            "text-lg",
                            variant === "default" ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 min-w-fit shrink-0">
                    <Button
                        asChild
                        size="lg"
                        variant={variant === "default" ? "secondary" : "default"}
                    >
                        <Link href={primaryAction.href} aria-label={`Go to ${primaryAction.text}`}>
                            {primaryAction.text}
                        </Link>
                    </Button>

                    {secondaryAction && (
                        <Button
                            asChild
                            size="lg"
                            variant={variant === "default" ? "outline" : "outline"}
                            className={variant === "default" ? "bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" : ""}
                        >
                            <Link href={secondaryAction.href} aria-label={`Go to ${secondaryAction.text}`}>
                                {secondaryAction.text}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        )
    }
)
CallToAction.displayName = "CallToAction"

export { CallToAction }
