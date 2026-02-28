"use client";

import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <div className="fixed flex w-full z-50 pt-6 pr-4 pl-4 top-0 left-0 justify-center">
      <nav className="glass gradient-border flex md:gap-12 md:w-auto w-full max-w-5xl rounded-full pt-2 pr-2 pb-2 pl-6 shadow-2xl shadow-black/50 gap-x-8 gap-y-8 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <BrainCircuit className="w-5 h-5 text-[#6155F5]" />
          <span className="text-base font-medium tracking-tight text-white">
            AgentMD
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#privacy"
            className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Privacy
          </a>
          <a
            href="#testimonials"
            className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Stories
          </a>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/chat"
            className="hidden md:block text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link href="/chat">
            <Button
              variant="default"
              size="sm"
              className="group relative overflow-hidden rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 text-zinc-400 hover:text-white border-0 uppercase text-xs tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(97,85,245,0.4)]"
            >
              <span className="relative z-10">Try Demo</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
