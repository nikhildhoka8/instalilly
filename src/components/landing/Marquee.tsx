"use client";

import { FileText, TestTube, Pill, FileStack, Stethoscope } from "lucide-react";

const integrations = [
  { name: "Medical Records", icon: FileStack },
  { name: "Lab Reports", icon: TestTube },
  { name: "Prescriptions", icon: Pill },
  { name: "Clinical Notes", icon: FileText },
  { name: "EHR Systems", icon: Stethoscope },
];

export function Marquee() {
  return (
    <div className="relative z-20 w-full max-w-6xl mx-auto px-6 pb-12 md:pb-20 animate-fade-slide-in delay-1400">
      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] opacity-40 grayscale hover:grayscale-0 transition-all duration-700 group">
        <div className="flex items-center justify-center md:justify-start [&_div]:mx-8 w-max animate-infinite-scroll">
          {[...integrations, ...integrations].map((item, index) => (
            <div key={index} className="group flex items-center gap-2">
              <item.icon className="w-6 h-6 text-white" />
              <span className="font-medium text-lg text-white whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
