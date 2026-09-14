import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-input bg-white dark:bg-card px-3 py-1 text-base sm:text-xs text-foreground shadow-2xs outline-none transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20 focus-visible:outline-none focus-visible:border-[#0B2545] dark:focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-[#0B2545]/15 dark:focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

