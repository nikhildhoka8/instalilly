"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Family Medicine",
    initials: "SC",
    quote:
      "Finally, an app that tells me what I need to know before seeing a patient without compromising their data. The medication extraction is incredibly accurate.",
    stars: 5,
  },
  {
    name: "Dr. Michael Torres",
    role: "Internal Medicine",
    initials: "MT",
    quote:
      "The drug interaction checking alone has saved me countless hours. I love that it runs entirely in my browser - no HIPAA concerns.",
    stars: 5,
  },
  {
    name: "Dr. Emily Park",
    role: "Pediatrics",
    initials: "EP",
    quote:
      "Beautiful interface and actually private. I replaced my old workflow immediately after trying AgentMD. It just works.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="w-full max-w-7xl z-20 mt-0 mr-auto mb-32 ml-auto pt-6 pr-6 pb-6 pl-6 relative"
    >
      <div className="flex flex-col text-center mb-20 items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6155F5]/20 bg-[#6155F5]/5 mb-6">
          <Star className="w-3 h-3 text-[#6155F5]" />
          <span className="text-xs font-semibold text-[#B89FFF] uppercase tracking-widest">
            Reviews
          </span>
        </div>
        <h2 className="md:text-7xl text-5xl font-medium text-white tracking-tighter mb-6">
          Loved by{" "}
          <span className="text-gradient-purple">Healthcare Providers</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group hover:bg-zinc-900/60 transition-all duration-500 bg-zinc-900/40 rounded-[2rem] p-8 backdrop-blur-sm border border-white/5"
          >
            <div className="flex text-[#FF8D28] mb-4 gap-1">
              {Array.from({ length: testimonial.stars }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              &quot;{testimonial.quote}&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                {testimonial.initials}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {testimonial.name}
                </h4>
                <p className="text-xs text-zinc-500">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
