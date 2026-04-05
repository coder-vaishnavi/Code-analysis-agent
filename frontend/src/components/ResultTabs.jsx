/**
 * ResultTabs — Tab bar for switching between Flowchart, Complexity, and Optimized Code
 */
import React from 'react'
import { Share2, TrendingUp, Sparkles } from 'lucide-react'

const TABS = [
  {
    id: 'flowchart',
    label: 'Flowchart',
    icon: Share2,
    color: 'text-brand-400',
    activeBg: 'from-brand-500/20 to-brand-700/10',
    activeBorder: 'border-brand-500/30',
    activeText: 'text-brand-300',
    dot: 'bg-brand-400',
  },
  {
    id: 'complexity',
    label: 'Complexity',
    icon: TrendingUp,
    color: 'text-amber-400',
    activeBg: 'from-amber-500/20 to-amber-700/10',
    activeBorder: 'border-amber-500/30',
    activeText: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  {
    id: 'optimized',
    label: 'Optimized Code',
    icon: Sparkles,
    color: 'text-violet-400',
    activeBg: 'from-violet-500/20 to-violet-700/10',
    activeBorder: 'border-violet-500/30',
    activeText: 'text-violet-300',
    dot: 'bg-violet-400',
  },
]

export default function ResultTabs({ activeTab, onTabChange, hasResults }) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-800/60 border border-white/5">
      {TABS.map(tab => {
        const Icon   = tab.icon
        const active = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-300 flex-1 justify-center
              ${active
                ? `bg-gradient-to-r ${tab.activeBg} border ${tab.activeBorder} ${tab.activeText} shadow-sm`
                : 'text-slate-500 hover:text-slate-300 hover:bg-surface-700/60 border border-transparent'
              }
            `}
          >
            <Icon size={14} className={active ? tab.activeText : 'opacity-60'} />
            <span>{tab.label}</span>

            {/* Active indicator dot */}
            {active && (
              <span
                className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${tab.dot}`}
              />
            )}

            {/* Results badge */}
            {hasResults && !active && (
              <span className={`w-1.5 h-1.5 rounded-full ${tab.dot} opacity-60`} />
            )}
          </button>
        )
      })}
    </div>
  )
}
