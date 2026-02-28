"use client";

import Link from "next/link";
import {
  Activity,
  FileText,
  Pill,
  FlaskConical,
  Signal,
  Wifi,
  Battery,
} from "lucide-react";

export function AppShowcase() {
  return (
    <section className="z-20 overflow-hidden w-full max-w-7xl mt-0 mr-auto mb-32 ml-auto pt-20 pb-20 relative">
      {/* Background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none pointer-events-none z-0">
        <h2 className="text-[12vw] leading-none font-bold text-white/[0.03] text-center whitespace-nowrap tracking-tighter">
          ASSISTANT
        </h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10 px-6">
        {/* Left Text */}
        <div className="lg:col-span-4 flex flex-col justify-center order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <span className="w-2 h-2 rounded-full bg-[#6155F5]" />
            <span className="text-xs font-mono text-gray-400 tracking-widest">
              LIVE DEMO
            </span>
          </div>
          <h3 className="leading-[1.1] uppercase md:text-7xl text-4xl font-normal text-white tracking-tight mb-8">
            Master Your{" "}
            <span className="text-gradient-purple">Workflow.</span>
          </h3>
        </div>

        {/* Center Phone */}
        <div className="lg:col-span-4 flex order-1 lg:order-2 lg:py-0 pt-12 pb-12 relative justify-center">
          <div className="-translate-x-1/2 -translate-y-1/2 blur-[100px] pointer-events-none bg-[#6155F5]/20 w-64 h-96 rounded-full absolute top-1/2 left-1/2" />
          <div className="border-[1px] overflow-hidden bg-zinc-950 w-[330px] h-[660px] z-10 border-zinc-800 rounded-[3.5rem] ring-white/10 ring-1 relative shadow-2xl">
            {/* Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-[32px] w-[110px] bg-black rounded-full z-50 flex items-center justify-between px-3" />

            {/* Status Bar */}
            <div className="absolute top-4 left-0 w-full px-8 flex justify-between items-center z-40 text-[10px] font-semibold text-white/90 tracking-wide">
              <span>9:41</span>
              <div className="flex gap-1.5 items-center">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* App UI */}
            <div className="flex flex-col z-10 bg-gradient-to-b from-zinc-900 to-black w-full h-full pt-16 pr-6 pl-6 relative">
              {/* Header */}
              <div className="flex z-10 mb-8 relative items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                    Today
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    Hello, Dr. Chen
                  </h2>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6155F5] to-[#B89FFF] opacity-80 border border-white/20" />
              </div>

              {/* Score Ring */}
              <div className="text-center mb-6">
                <div className="w-40 h-40 mx-auto rounded-full border-4 border-[#6155F5]/20 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                    <circle
                      cx="80"
                      cy="80"
                      r="78"
                      fill="none"
                      stroke="#6155F5"
                      strokeWidth="4"
                      strokeDasharray="490"
                      strokeDashoffset="60"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-medium text-white tracking-tighter font-mono">
                      12
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                      Patients
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full h-32 mb-6 relative">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 280 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,80 C20,80 30,60 50,65 C70,70 80,90 100,85 C120,80 130,40 150,45 C170,50 180,70 200,60 C220,50 230,20 250,25 C265,28 275,10 280,15"
                    fill="none"
                    stroke="#34C759"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34C759" stopOpacity="0.2" />
                      <stop
                        offset="100%"
                        stopColor="#34C759"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 C20,80 30,60 50,65 C70,70 80,90 100,85 C120,80 130,40 150,45 C170,50 180,70 200,60 C220,50 230,20 250,25 C265,28 275,10 280,15 V120 H0 Z"
                    fill="url(#grad)"
                  />
                </svg>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                  <div className="text-[#6155F5] mb-1">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-white font-semibold text-lg">24</div>
                  <div className="text-[10px] text-zinc-500">Documents</div>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                  <div className="text-emerald-400 mb-1">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="text-white font-semibold text-lg">156</div>
                  <div className="text-[10px] text-zinc-500">Medications</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stats */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:items-start order-3 justify-center relative z-10">
          <div className="glass-card w-full max-w-sm rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#6155F5]/20 flex items-center justify-center text-[#6155F5]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-medium">Daily Report</h3>
                <p className="text-xs text-zinc-400">Synced 2m ago</p>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase">
                  Documents
                </span>
                <div className="text-white font-semibold">24</div>
              </div>
              <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase">
                  Alerts
                </span>
                <div className="text-white font-semibold">3</div>
              </div>
            </div>
          </div>

          <Link
            href="/chat"
            className="text-[#6155F5] hover:text-[#B89FFF] transition-colors text-sm font-medium flex items-center gap-2"
          >
            Try the demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
