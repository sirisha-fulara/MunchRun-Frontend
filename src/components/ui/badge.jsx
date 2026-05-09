import { cn } from "../../lib/utils"

export function Badge({ className, variant = "default", ...props }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      {
        "bg-primary text-primary-foreground": variant === "default",
        "bg-secondary text-secondary-foreground": variant === "secondary",
        "bg-destructive text-destructive-foreground": variant === "destructive",
        "border border-input bg-background": variant === "outline",
        "bg-green-100 text-green-800": variant === "success",
        "bg-yellow-100 text-yellow-800": variant === "warning",
      },
      className
    )} {...props} />
  )
}