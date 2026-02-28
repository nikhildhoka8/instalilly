"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "large";
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "default",
  children,
  className,
  id,
}: FeatureCardProps) {
  if (variant === "large") {
    return (
      <div
        id={id}
        className={cn(
          "group overflow-hidden glass-card z-10 rounded-[2.5rem] mb-6 relative",
          className
        )}
      >
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-tr from-[#6155F5]/10 via-transparent to-transparent opacity-40 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-0">
          <div className="md:p-16 flex flex-col z-10 pt-8 pr-8 pb-8 pl-8 relative justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-2">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="leading-[1.1] md:text-4xl text-3xl font-semibold text-white tracking-tight mt-6 mb-6">
              {title}
            </h2>
            <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
              <p>{description}</p>
            </div>
          </div>

          {children && (
            <div className="relative min-h-[500px] bg-zinc-950/30 border-l border-white/5 overflow-hidden">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={cn(
        "group overflow-hidden flex flex-col hover:border-white/20 transition-colors duration-500 glass-card rounded-[2rem]",
        className
      )}
    >
      <div className="flex overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent h-64 relative items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(97,85,245,0.05),transparent_70%)]" />
        {children}
      </div>
      <div className="mt-auto pt-8 pr-10 pb-10 pl-10">
        <div className="flex items-center gap-3 mb-5">
          <Icon className="w-6 h-6 text-white" />
          <h3 className="text-xl font-semibold text-white tracking-tight">
            {title}
          </h3>
        </div>
        <p className="text-gray-400 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
