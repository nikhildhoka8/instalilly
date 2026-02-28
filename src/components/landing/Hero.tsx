"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Marquee } from "./Marquee";
import { Stethoscope } from "lucide-react";

export function Hero() {
  return (
    <section
      className="min-h-screen flex flex-col md:pt-20 overflow-hidden w-full pt-32 relative items-center justify-center"
      style={{
        maskImage:
          "linear-gradient(180deg, transparent, black 0%, black 95%, transparent)",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent, black 0%, black 95%, transparent)",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6155F5]/10 via-zinc-900/20 to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Grid/Curtain Structure */}
      <div className="absolute inset-0 w-full h-full grid grid-cols-1 md:grid-cols-7 gap-0 -z-10 pointer-events-none">
        <div className="relative h-full hidden md:block border-r border-white/5 animate-column-reveal delay-100">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[75%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="relative h-full hidden md:block border-r border-white/5 animate-column-reveal delay-200">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[65%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="relative h-full hidden md:block border-r border-white/5 animate-column-reveal delay-300">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[55%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="relative h-full border-r border-white/5 md:border-none animate-column-reveal delay-400">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[45%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
          <div className="absolute top-[20%] left-0 right-0 h-[30%] bg-gradient-to-b from-[#6155F5]/5 to-transparent pointer-events-none" />
        </div>
        <div className="relative h-full hidden md:block border-l border-white/5 animate-column-reveal delay-500">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[55%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="relative h-full hidden md:block border-l border-white/5 animate-column-reveal delay-600">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[65%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="relative h-full hidden md:block border-l border-white/5 animate-column-reveal delay-700">
          <div className="absolute bottom-0 left-0 right-0 bg-black h-[75%] border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-5xl z-10 mt-24 mr-auto mb-24 ml-auto pr-6 pl-6 relative">
        {/* Badge */}
        <div className="animate-fade-slide-in delay-800 inline-flex transition-transform hover:scale-105 cursor-pointer group glass-card rounded-full mb-10 pt-1.5 pr-3 pb-1.5 pl-3 gap-x-2 gap-y-2 items-center">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#6155F5] shadow-[0_0_10px_rgba(97,85,245,0.5)] group-hover:animate-pulse" />
          <span className="text-xs font-medium text-zinc-300 tracking-wide group-hover:text-white transition-colors">
            Powered by On-Device AI
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-slide-in delay-1000 flex flex-wrap justify-center gap-x-[0.25em] gap-y-2 leading-[1.1] md:text-8xl cursor-default text-5xl sm:text-6xl font-medium tracking-tighter mb-8">
          <span className="inline-flex bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 opacity-90">
            Pre-Visit
          </span>
          <span className="inline-flex bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 opacity-90">
            Intelligence.
          </span>
          <span className="text-gradient-purple">Private by Design.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-slide-in delay-1200 leading-relaxed md:text-2xl text-lg sm:text-xl text-gray-400 tracking-normal max-w-3xl mr-auto mb-12 ml-auto font-medium">
          The first web app that analyzes prescriptions, lab reports, and
          medical records using local AI. Patient data never leaves your
          browser.
        </p>

        {/* CTAs */}
        <div className="animate-fade-slide-in delay-1400 flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          <Link href="/chat">
            <Button
              size="lg"
              className="group relative overflow-hidden uppercase transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(97,85,245,0.5)] text-sm font-medium text-white tracking-widest rounded-full pt-5 pr-12 pb-5 pl-12 bg-zinc-950 border border-white/10"
            >
              <div className="absolute inset-0 -z-20 rounded-full overflow-hidden p-[1px]">
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#6155F5_360deg)] animate-spin-slow" />
                <div className="absolute inset-[1px] rounded-full bg-black" />
              </div>
              <div className="-z-10 overflow-hidden bg-zinc-950 rounded-full absolute top-[2px] right-[2px] bottom-[2px] left-[2px]">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/60 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-[#6155F5]/10 blur-2xl rounded-full pointer-events-none transition-colors duration-500 group-hover:bg-[#6155F5]/30" />
              </div>
              <Stethoscope className="w-4 h-4 mr-2" />
              <span className="relative z-10 text-white/90 transition-colors group-hover:text-white">
                Try Demo
              </span>
            </Button>
          </Link>

          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full pt-5 pr-12 pb-5 pl-12 uppercase text-sm tracking-widest border-white/10 text-gray-400 hover:text-white hover:border-white/20 bg-transparent"
            >
              Learn More
            </Button>
          </a>
        </div>
      </div>

      {/* Scroll Marquee */}
      <Marquee />
    </section>
  );
}
