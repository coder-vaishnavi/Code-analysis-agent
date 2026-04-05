/**
 * OptimizedCodeTab — Displays AI-suggested optimized version of the code
 * with syntax highlighting and copy/download actions
 */
import React, { useState } from 'react'
import { Sparkles, Copy, Check, Download, Code } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'

// Map our lang ids to Prism language ids
const LANG_MAP = {
  python:     'python',
  javascript: 'javascript',
  java:       'java',
  cpp:        'cpp',
  typescript: 'typescript',
  go:         'go',
  rust:       'rust',
}

export default function OptimizedCodeTab({ optimizedCode, language, loading }) {
  const [copied, setCopied] = useState(false)

  const prismLang = LANG_MAP[language] || 'python'

  async function handleCopy() {
    await navigator.clipboard.writeText(optimizedCode || '')
    setCopied(true)
    toast.success('Optimized code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const ext = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', typescript: 'ts', go: 'go', rust: 'rs' }
    const blob = new Blob([optimizedCode || ''], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `optimized.${ext[language] || 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded!')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            AI-Optimized Code
          </span>
          {optimizedCode && !loading && (
            <span className="badge bg-violet-400/10 text-violet-400 border border-violet-400/20 text-[10px]">
              ✦ Improved
            </span>
          )}
        </div>

        {optimizedCode && !loading && (
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopy} className="btn-secondary !px-3 !py-1.5 !text-xs">
              {copied
                ? <><Check size={12} className="text-emerald-400" /><span>Copied!</span></>
                : <><Copy size={12} /><span>Copy</span></>
              }
            </button>
            <button onClick={handleDownload} className="btn-secondary !px-3 !py-1.5 !text-xs">
              <Download size={12} />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 glass-card border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            {/* Animated code loading lines */}
            <div className="w-full px-6 space-y-2.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div
                    className="h-3 rounded-full shimmer bg-surface-600"
                    style={{ width: `${30 + Math.random() * 50}%`, animationDelay: `${i * 100}ms` }}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-2">Generating optimized version...</p>
          </div>
        ) : !optimizedCode ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-white/5 flex items-center justify-center">
              <Code size={28} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">No optimized code yet</p>
              <p className="text-xs text-slate-600 mt-1">
                The AI will suggest improvements after analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto animate-in">
            {/* Optimization highlights banner */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-500/10 border-b border-violet-500/20">
              <Sparkles size={13} className="text-violet-400 flex-shrink-0" />
              <p className="text-xs text-violet-300">
                AI has suggested an optimized version. Review changes carefully before using in production.
              </p>
            </div>

            {/* Syntax-highlighted code */}
            <SyntaxHighlighter
              language={prismLang}
              style={vscDarkPlus}
              showLineNumbers
              lineNumberStyle={{
                color: '#3d4558',
                fontSize: '11px',
                paddingRight: '16px',
                minWidth: '40px',
                userSelect: 'none',
              }}
              customStyle={{
                margin: 0,
                background: 'transparent',
                fontSize: '13px',
                lineHeight: '22px',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                padding: '16px',
              }}
              codeTagProps={{
                style: {
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                }
              }}
            >
              {optimizedCode}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  )
}
