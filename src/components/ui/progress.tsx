import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    // Ensure value is bounded between 0 and 100
    const safeValue = Math.min(Math.max(value, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted/80",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-gradient-to-r from-neon-primary to-violet-500 transition-all duration-500 ease-in-out",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - safeValue}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
