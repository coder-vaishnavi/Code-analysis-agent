/**
 * Navbar — Top navigation bar with branding and status badges
 */
import React from 'react'
import { Zap, Star } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow-sm">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-surface-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              AI Code Explainer
            </h1>
            <p className="text-[11px] text-brand-400 font-medium tracking-wide mt-0.5">
              Flow Visualizer · Powered by LLaMA3
            </p>
          </div>
        </div>

        {/* Right side badges */}
        <div className="flex items-center gap-3">
          {/* Live status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Groq API Live</span>
          </div>

          {/* Model badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20">
            <Star size={11} className="text-brand-400 fill-brand-400" />
            <span className="text-xs font-medium text-brand-300">LLaMA3–70B</span>
          </div>
        </div>
      </div>
    </header>
  )
}
