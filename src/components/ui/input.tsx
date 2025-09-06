import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // Check if light mode classes are passed in className
  const isLightMode = className?.includes('bg-white') || className?.includes('bg-gray-');
  
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styling - conditional based on light/dark mode
        "flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 ease-in-out",
        // Light mode styling (when light mode classes are detected)
        isLightMode ? [
          "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
          "shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
          "aria-invalid:border-red-400 aria-invalid:ring-red-400/20",
          "selection:bg-blue-200 selection:text-blue-900"
        ] : [
          // Dark mode styling (default)
          "border-white/20 bg-slate-800/50 backdrop-blur-sm text-white placeholder:text-slate-400",
          "hover:border-cyan-400/40 hover:bg-slate-800/70",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 focus:bg-slate-800/80",
          "backdrop-blur-md bg-gradient-to-r from-slate-800/40 to-slate-900/60",
          "shadow-lg shadow-black/10",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/20",
          "aria-invalid:border-red-400/50 aria-invalid:ring-red-400/20",
          "selection:bg-cyan-400/20 selection:text-cyan-100"
        ],
        // File input styling (same for both modes)
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        isLightMode ? "file:text-gray-700" : "file:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
