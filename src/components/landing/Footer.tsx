"use client";

import Link from "next/link";
import { BrainCircuit, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative w-full bg-zinc-900/30 pt-24 pb-8 border-t border-white/5 backdrop-blur-sm z-20">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5 flex flex-col">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-8 h-8 text-[#6155F5]" />
              <h3 className="text-5xl font-medium text-white tracking-tighter">
                AgentMD
              </h3>
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs">
              AI-powered pre-visit data extraction for healthcare providers.
              Patient data never leaves your browser.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              <div className="flex flex-col gap-4">
                <h4 className="text-base font-medium text-white">Product</h4>
                <a
                  href="#features"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Features
                </a>
                <a
                  href="#privacy"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Privacy
                </a>
                <Link
                  href="/chat"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Try Demo
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-base font-medium text-white">Company</h4>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Contact
                </a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-base font-medium text-white">Legal</h4>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  HIPAA
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-zinc-500">
            © 2026 AgentMD. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
