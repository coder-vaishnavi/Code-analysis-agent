/**
 * ComplexityTab — Visualizes time and space complexity analysis
 */
import React from 'react'
import { TrendingUp, Cpu, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// Big-O complexity levels mapped to color and bar width
const COMPLEXITY_MAP = {
  'O(1)':        { label: 'Constant',    color: '#22c55e', bar: 8,  grade: 'Excellent' },
  'O(log n)':    { label: 'Logarithmic', color: '#84cc16', bar: 20, grade: 'Excellent' },
  'O(n)':        { label: 'Linear',      color: '#eab308', bar: 40, grade: 'Good' },
  'O(n log n)':  { label: 'Linearithmic',color: '#f97316', bar: 60, grade: 'Fair' },
  'O(n²)':       { label: 'Quadratic',   color: '#ef4444', bar: 80, grade: 'Poor' },
  'O(n^2)':      { label: 'Quadratic',   color: '#ef4444', bar: 80, grade: 'Poor' },
  'O(2^n)':      { label: 'Exponential', color: '#dc2626', bar: 95, grade: 'Bad' },
  'O(n!)':       { label: 'Factorial',   color: '#9f1239', bar: 100,grade: 'Terrible' },
}

function parseComplexity(text) {
  if (!text) return { time: null, space: null }
  const timeMatch = text.match(/time[:\s]+([O(][^\n,;]+)/i)
  const spaceMatch = text.match(/space[:\s]+([O(][^\n,;]+)/i)
  return {
    time:  timeMatch  ? timeMatch[1].trim()  : null,
    space: spaceMatch ? spaceMatch[1].trim() : null,
    raw: text,
  }
}

function getComplexityInfo(notation) {
  if (!notation) return null
  for (const [key, val] of Object.entries(COMPLEXITY_MAP)) {
    if (notation.toLowerCase().includes(key.toLowerCase())) return { ...val, notation: key }
  }
  return { label: 'Custom', color: '#748ffc', bar: 50, grade: 'Analysis', notation }
}

function ComplexityCard({ title, icon: Icon, iconColor, complexity, info }) {
  return (
    <div className="p-5 rounded-2xl bg-surface-700/50 border border-white/5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}18` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{complexity || '—'}</p>
        </div>
        {info && (
          <div className="ml-auto">
            <span
              className="badge text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                background: `${info.color}18`,
                color: info.color,
                border: `1px solid ${info.color}30`,
              }}
            >
              {info.grade}
            </span>
          </div>
        )}
      </div>

      {/* Bar */}
      {info && (
        <div>
          <div className="complexity-bar">
            <div
              className="complexity-fill"
              style={{
                width: `${info.bar}%`,
                background: `linear-gradient(90deg, ${info.color}80, ${info.color})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-600">O(1) — Best</span>
            <span className="text-[10px] text-slate-500 font-mono">{info.label}</span>
            <span className="text-[10px] text-slate-600">O(n!) — Worst</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Big-O reference table
const REFERENCE_TABLE = [
  { notation: 'O(1)',       type: 'Constant',      example: 'Array access, hash lookup',       color: '#22c55e' },
  { notation: 'O(log n)',   type: 'Logarithmic',   example: 'Binary search, balanced BST',     color: '#84cc16' },
  { notation: 'O(n)',       type: 'Linear',         example: 'Linear search, single loop',     color: '#eab308' },
  { notation: 'O(n log n)', type: 'Linearithmic',  example: 'Merge sort, heap sort',           color: '#f97316' },
  { notation: 'O(n²)',      type: 'Quadratic',      example: 'Bubble sort, nested loops',      color: '#ef4444' },
  { notation: 'O(2ⁿ)',      type: 'Exponential',   example: 'Fibonacci recursive, subsets',    color: '#dc2626' },
]

export default function ComplexityTab({ complexity, loading }) {
  const [copied, setCopied] = useState(false)
  const parsed = parseComplexity(complexity)
  const timeInfo  = getComplexityInfo(parsed.time)
  const spaceInfo = getComplexityInfo(parsed.space)

  async function handleCopy() {
    await navigator.clipboard.writeText(complexity || '')
    setCopied(true)
    toast.success('Complexity copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto space-y-5 pr-1">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Complexity Analysis
          </span>
        </div>
        {complexity && (
          <button onClick={handleCopy} className="btn-secondary !px-3 !py-1.5 !text-xs">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface-700/50 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl shimmer bg-surface-600" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 rounded shimmer bg-surface-600" />
                  <div className="h-5 w-32 rounded shimmer bg-surface-600" />
                </div>
              </div>
              <div className="h-2 rounded-full shimmer bg-surface-600" />
            </div>
          ))}
        </div>
      ) : !complexity ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-white/5 flex items-center justify-center">
            <TrendingUp size={28} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-500">Complexity will appear here after analysis</p>
        </div>
      ) : (
        <div className="space-y-4 animate-in">
          {/* Complexity cards */}
          <ComplexityCard
            title="Time Complexity"
            icon={TrendingUp}
            iconColor="#5c7cfa"
            complexity={parsed.time || complexity}
            info={timeInfo}
          />
          <ComplexityCard
            title="Space Complexity"
            icon={Cpu}
            iconColor="#a78bfa"
            complexity={parsed.space || '—'}
            info={spaceInfo}
          />

          {/* Raw analysis */}
          {parsed.raw && (
            <div className="p-4 rounded-xl bg-surface-700/40 border border-white/5">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Full Analysis</p>
              <p className="text-sm text-slate-300 leading-relaxed">{parsed.raw}</p>
            </div>
          )}
        </div>
      )}

      {/* Big-O Reference Table */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Big-O Reference</p>
        <div className="rounded-xl overflow-hidden border border-white/5">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-700/60">
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold">Notation</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold">Type</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold hidden sm:table-cell">Example</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_TABLE.map((row, i) => (
                <tr
                  key={row.notation}
                  className={`border-t border-white/5 hover:bg-surface-700/30 transition-colors ${
                    i % 2 === 0 ? 'bg-surface-800/20' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: row.color }}>
                    {row.notation}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{row.type}</td>
                  <td className="px-4 py-2.5 text-slate-500 hidden sm:table-cell">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
