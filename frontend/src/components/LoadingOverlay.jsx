/**
 * LoadingOverlay — Full-screen animated loading overlay during AI analysis
 */
import React, { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

const MESSAGES = [
  'Parsing your code...',
  'Identifying patterns and logic...',
  'Generating explanation...',
  'Building flowchart...',
  'Analyzing complexity...',
  'Optimizing code...',
  'Almost done...',
]

export default function LoadingOverlay({ visible }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress]  = useState(0)

  useEffect(() => {
    if (!visible) {
      setMsgIndex(0)
      setProgress(0)
      return
    }

    const msgTimer = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length)
    }, 1800)

    const progTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p          // stall at 90% until real data arrives
        return p + Math.random() * 12
      })
    }, 600)

    return () => {
      clearInterval(msgTimer)
      clearInterval(progTimer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card gradient-border p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        {/* Animated icon */}
        <div className="relative flex items-center justify-center">
          {/* Rings */}
          <div className="absolute w-20 h-20 rounded-full border border-brand-500/30 animate-ping" />
          <div className="absolute w-28 h-28 rounded-full border border-brand-500/10 animate-ping"
               style={{ animationDelay: '0.4s' }} />
          {/* Core */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-md animate-pulse-slow">
            <Zap size={24} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-1">AI is Analyzing</h3>
          <p className="text-sm text-brand-400 font-medium transition-all duration-500 min-h-[20px]">
            {MESSAGES[msgIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Processing</span>
            <span>{Math.round(Math.min(progress, 90))}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-600 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progress, 90)}%`,
                background: 'linear-gradient(90deg, #4c6ef5, #7c5cfa)',
                boxShadow: '0 0 8px rgba(92, 124, 250, 0.6)',
              }}
            />
          </div>
        </div>

        {/* Dots animation */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        <p className="text-xs text-slate-600 text-center">
          Powered by LLaMA3-70B via Groq
        </p>
      </div>
    </div>
  )
}
