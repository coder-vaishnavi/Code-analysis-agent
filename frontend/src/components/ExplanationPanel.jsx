/**
 * ExplanationPanel — Displays AI-generated code explanation
 * with highlighted keywords, line-by-line breakdown, and example I/O
 */
import React, { useState } from 'react'
import { Lightbulb, Copy, Check, ChevronRight, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'

// Keywords to highlight in the explanation
const HIGHLIGHT_KEYWORDS = [
  'O(n)', 'O(log n)', 'O(1)', 'O(n²)', 'O(n log n)',
  'time complexity', 'space complexity', 'recursion', 'iteration',
  'loop', 'function', 'variable', 'algorithm', 'data structure',
  'array', 'list', 'hash map', 'tree', 'graph', 'stack', 'queue',
  'binary search', 'sorting', 'dynamic programming', 'greedy',
  'divide and conquer', 'memoization', 'backtracking',
]

function highlightText(text) {
  if (!text) return null
  const pattern = new RegExp(
    `(${HIGHLIGHT_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  )
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    HIGHLIGHT_KEYWORDS.some(k => k.toLowerCase() === part.toLowerCase())
      ? <span key={i} className="keyword-highlight">{part}</span>
      : part
  )
}

function CopyButton({ text, small = false }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg transition-all duration-200
        ${small
          ? 'p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10'
          : 'px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-brand-300 bg-surface-700 hover:bg-brand-500/10 border border-white/5'
        }`}
      title="Copy to clipboard"
    >
      {copied
        ? <Check size={13} className="text-emerald-400" />
        : <Copy size={13} />
      }
      {!small && <span>{copied ? 'Copied!' : 'Copy'}</span>}
    </button>
  )
}

function SkeletonLine({ width = 'w-full' }) {
  return (
    <div className={`h-3.5 ${width} rounded-full shimmer bg-surface-600`} />
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      {[...Array(6)].map((_, i) => (
        <SkeletonLine key={i} width={i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-4/5'} />
      ))}
    </div>
  )
}

export default function ExplanationPanel({ explanation, loading, error }) {
  const [activeSection, setActiveSection] = useState('simple')

  // Parse the explanation into sections if it has line-by-line format
  function parseExplanation(text) {
    if (!text) return { simple: '', lineByLine: [], example: '' }

    // Try to split by sections
    const simpleMatch = text.match(/simple explanation[:\n]+([\s\S]+?)(?=line[- ]by[- ]line|example|$)/i)
    const lineByLineMatch = text.match(/line[- ]by[- ]line[:\n]+([\s\S]+?)(?=example input|example:|$)/i)
    const exampleMatch = text.match(/example[^:]*:[:\n]+([\s\S]+?)$/i)

    const lines = text.split('\n').filter(l => l.trim())

    return {
      simple: simpleMatch ? simpleMatch[1].trim() : text,
      lineByLine: lineByLineMatch
        ? lineByLineMatch[1].split('\n').filter(l => l.trim())
        : lines.slice(0, Math.min(lines.length, 8)),
      example: exampleMatch ? exampleMatch[1].trim() : '',
    }
  }

  const parsed = parseExplanation(explanation)

  const sections = [
    { id: 'simple',  label: 'Summary',      icon: Lightbulb },
    { id: 'lines',   label: 'Line by Line',  icon: ChevronRight },
    { id: 'example', label: 'Example I/O',   icon: Terminal },
  ]

  return (
    <div className="flex flex-col h-full glass-card gradient-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-surface-900/40">
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
            AI Explanation
          </span>
        </div>
        {explanation && <CopyButton text={explanation} />}
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-surface-900/20">
        {sections.map(sec => {
          const Icon = sec.icon
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${activeSection === sec.id
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface-700'
                }`}
            >
              <Icon size={11} />
              {sec.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">Analysis Failed</p>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : !explanation ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-white/5 flex items-center justify-center">
              <Lightbulb size={28} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">No analysis yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Paste your code and click <span className="text-brand-400">Analyze</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in">
            {activeSection === 'simple' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface-700/50 border border-white/5">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {highlightText(parsed.simple)}
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'lines' && (
              <div className="space-y-2">
                {parsed.lineByLine.map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 rounded-xl bg-surface-700/40 border border-white/5 hover:bg-surface-700/70 transition-colors"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-md bg-brand-500/20 text-brand-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {highlightText(line.replace(/^\d+\.\s*/, ''))}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'example' && (
              <div className="space-y-3">
                {parsed.example ? (
                  <div className="p-4 rounded-xl bg-surface-900/70 border border-white/8 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Terminal size={13} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Example</span>
                      <CopyButton text={parsed.example} small />
                    </div>
                    <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                      {parsed.example}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No example section found in this analysis.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
