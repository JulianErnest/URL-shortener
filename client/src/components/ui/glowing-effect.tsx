import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowingEffectProps {
  children: ReactNode;
  className?: string;
}

export const GlowingEffect = ({ children, className }: GlowingEffectProps) => {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
      <div className="relative bg-black/90 backdrop-blur-sm rounded-lg p-4 transition-transform duration-300 group-hover:scale-[1.02]">
        {children}
      </div>
    </div>
  );
} 