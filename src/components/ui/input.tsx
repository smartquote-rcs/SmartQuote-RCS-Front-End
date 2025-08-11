import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styling - Databox style modern input
        "flex h-10 w-full rounded-lg border border-white/20 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-slate-400",
        // Transitions and hover effects
        "transition-all duration-200 ease-in-out",
        "hover:border-cyan-400/40 hover:bg-slate-800/70",
        // Focus styling - modern ring effect
        "focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 focus:bg-slate-800/80",
        // Glass effect
        "backdrop-blur-md bg-gradient-to-r from-slate-800/40 to-slate-900/60",
        // File input styling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-300",
        // Selection styling
        "selection:bg-cyan-400/20 selection:text-cyan-100",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/20",
        // Error state
        "aria-invalid:border-red-400/50 aria-invalid:ring-red-400/20",
        // Enhanced shadow for depth
        "shadow-lg shadow-black/10",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
