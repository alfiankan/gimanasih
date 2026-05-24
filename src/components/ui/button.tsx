import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'neon' | 'neon-secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Class definitions matching Shadcn theme and our neon branding
    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer"
    
    const variantClasses = {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98]",
      outline: "border border-border/80 bg-background/50 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-muted text-foreground hover:bg-muted/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      // Custom brand styles
      neon: "bg-gradient-to-r from-neon-primary to-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98]",
      "neon-secondary": "bg-gradient-to-r from-neon-secondary to-teal-600 text-secondary-foreground shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:scale-[1.02] active:scale-[0.98]"
    }

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-2xl px-8 text-base",
      icon: "h-10 w-10"
    }

    return (
      <Comp
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
