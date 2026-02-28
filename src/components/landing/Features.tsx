"use client";

import { Cpu, ShieldCheck, FlaskConical, Pill, AlertTriangle, Activity, Zap, Heart, BatteryCharging } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export function Features() {
  return (
    <section
      id="features"
      className="z-20 w-full max-w-7xl mt-24 mr-auto mb-24 ml-auto pt-10 pr-2 pb-32 pl-2 relative"
    >
      {/* Large Feature Card - Document Analysis */}
      <FeatureCard
        icon={Cpu}
        title="On-Device Document Analysis"
        description="AgentMD connects the dots between prescriptions, lab reports, and medical records using browser-based AI. Get comprehensive pre-visit summaries without compromising patient privacy."
        variant="large"
      >
        {/* Code Visual */}
        <div className="absolute inset-0 p-8 text-xs md:text-sm leading-relaxed text-gray-500 select-none opacity-40 pointer-events-none">
          <div className="flex gap-1.5 mb-6 opacity-50">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <div className="font-mono space-y-1">
            <p>
              <span className="text-purple-400">import</span> {"{"}{" "}
              <span className="text-[#6155F5]">MedicalExtractor</span> {"}"}{" "}
              <span className="text-purple-400">from</span>{" "}
              <span className="text-emerald-400">&quot;@agentmd/core&quot;</span>;
            </p>
            <p className="h-4"></p>
            <p>
              <span className="text-purple-400">class</span>{" "}
              <span className="text-blue-400">DocumentAnalyzer</span> {"{"}
            </p>
            <p className="pl-4">
              <span className="text-purple-400">private</span> model ={" "}
              <span className="text-blue-400">WebLLM</span>(
              <span className="text-emerald-400">&quot;medical-v2&quot;</span>)
            </p>
            <p className="pl-4">
              <span className="text-purple-400">async</span>{" "}
              <span className="text-blue-400">extractMedications</span>(doc) {"{"}
            </p>
            <p className="pl-8">
              <span className="text-purple-400">const</span> meds ={" "}
              <span className="text-[#6155F5]">await</span> this.model.extract(doc)
            </p>
            <p className="pl-8">
              <span className="text-gray-500">
                // Data stays local. Zero cloud uploads.
              </span>
            </p>
            <p className="pl-8">
              <span className="text-purple-400">return</span>{" "}
              <span className="text-blue-400">Medications</span>.validate(meds)
            </p>
            <p className="pl-4">{"}"}</p>
            <p>{"}"}</p>
          </div>
        </div>

        {/* Floating Status Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[90%] max-w-md">
          <div className="rounded-2xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h4 className="text-white font-normal text-sm tracking-wide">
                  Document Status
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <p className="text-emerald-500 text-xs font-normal tracking-wide">
                    Analyzing...
                  </p>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="divide-y divide-white/5 text-sm">
              <div className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-normal">Medications</span>
                    <span className="text-gray-500 text-xs mt-0.5">
                      Found 4 active
                    </span>
                  </div>
                </div>
                <span className="text-gray-200 text-xs font-mono">Extracted</span>
              </div>
              <div className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#6155F5]/10 flex items-center justify-center text-[#6155F5] shrink-0">
                    <FlaskConical className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-normal">Lab Results</span>
                    <span className="text-gray-500 text-xs mt-0.5">
                      12 values parsed
                    </span>
                  </div>
                </div>
                <span className="text-gray-200 text-xs font-mono">2 flagged</span>
              </div>
              <div className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <BatteryCharging className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-normal">Summary</span>
                    <span className="text-gray-500 text-xs mt-0.5">
                      Generating...
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  98%
                </span>
              </div>
            </div>
          </div>
        </div>
      </FeatureCard>

      {/* Smaller Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Privacy Card */}
        <FeatureCard
          icon={ShieldCheck}
          title="True Privacy"
          description="Unlike other apps, AgentMD's architecture ensures zero-knowledge privacy. Patient data never leaves your browser - all processing happens locally."
          id="privacy"
        >
          <div className="flex w-full h-full relative items-center justify-center">
            <div className="absolute w-[260px] h-[260px] border border-dashed border-white/5 rounded-full flex items-center justify-center opacity-60" />
            <div className="absolute w-40 h-40 border border-dashed border-white/10 rounded-full flex items-center justify-center" />
            <div className="relative z-20 w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center group cursor-pointer transition-all duration-500 hover:scale-105">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="absolute top-[25%] right-[28%] z-10 w-10 h-10 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-[#6155F5]" />
            </div>
          </div>
        </FeatureCard>

        {/* Drug Interactions Card */}
        <FeatureCard
          icon={AlertTriangle}
          title="Drug Interactions"
          description="Automatically detect potential drug interactions and contraindications. Get instant alerts for unsafe medication combinations."
        >
          <div className="flex items-end gap-2 h-32 w-48">
            <div className="flex-1 bg-[#6155F5]/30 rounded-t-sm h-[40%] animate-pulse" />
            <div className="flex-1 bg-[#6155F5]/80 rounded-t-sm h-[80%]" />
            <div className="flex-1 bg-red-500/60 rounded-t-sm h-[50%] animate-pulse" />
            <div className="flex-1 bg-[#6155F5] rounded-t-sm h-[90%]" />
            <div className="flex-1 bg-[#6155F5]/30 rounded-t-sm h-[30%]" />
          </div>
        </FeatureCard>
      </div>
    </section>
  );
}
