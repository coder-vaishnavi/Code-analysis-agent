/**
 * App.jsx — Root component
 * Dashboard layout: [Code Editor | Explanation Panel] on top,
 * [Tabs Section: Flowchart | Complexity | Optimized Code] on bottom
 */
import React, { useState, useRef, useCallback } from 'react'
import './index.css'

import Navbar            from './components/Navbar'
import CodeEditor        from './components/CodeEditor'
import ExplanationPanel  from './components/ExplanationPanel'
import FlowchartTab      from './components/FlowchartTab'
import ComplexityTab     from './components/ComplexityTab'
import OptimizedCodeTab  from './components/OptimizedCodeTab'
import ResultTabs        from './components/ResultTabs'
import LoadingOverlay    from './components/LoadingOverlay'
import { useAnalyze }    from './hooks/useAnalyze'

// Default sample code shown on first load
const DEFAULT_CODE = `def binary_search(arr, target):
    """
    Binary search algorithm — O(log n) time complexity.
    Returns index of target or -1 if not found.
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
sorted_arr = [1, 3, 5, 7, 9, 11, 13, 15]
result = binary_search(sorted_arr, 7)
print(f"Found at index: {result}")`

export default function App() {
  const [code,      setCode]     = useState(DEFAULT_CODE)
  const [language,  setLanguage] = useState('python')
  const [activeTab, setActiveTab] = useState('flowchart')

  const { loading, error, result, analyze } = useAnalyze()

  const hasResults = Boolean(
    result.explanation || result.flowchart || result.complexity || result.optimizedCode
  )

  function handleAnalyze() {
    analyze(code, language)
  }

  // PDF download using html2pdf.js loaded dynamically
  async function handleDownloadPDF() {
    if (!hasResults) return
    const { default: html2pdf } = await import('html2pdf.js')
    const element = document.getElementById('pdf-content')
    if (!element) return

    html2pdf().set({
      margin:      [10, 10],
      filename:    'code-analysis.pdf',
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#0d0f14' },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(element).save()
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-900">
      {/* Top navigation */}
      <Navbar />

      {/* Loading overlay */}
      <LoadingOverlay visible={loading} />

      {/* Main content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* ── Hero tagline ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              Code{' '}
              <span className="text-gradient">Analysis Dashboard</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Paste any code → Get instant AI explanation, flowchart &amp; complexity
            </p>
          </div>

          {/* Download PDF button (shown when results exist) */}
          {hasResults && (
            <button
              onClick={handleDownloadPDF}
              className="btn-secondary self-start sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Download PDF
            </button>
          )}
        </div>

        {/* ── Top Split: Editor + Explanation ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ minHeight: '420px' }}>
          {/* Left — Code Editor */}
          <div className="h-[420px] lg:h-auto">
            <CodeEditor
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={lang => {
                setLanguage(lang)
              }}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
          </div>

          {/* Right — Explanation Panel */}
          <div className="h-[420px] lg:h-auto">
            <ExplanationPanel
              explanation={result.explanation}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* ── Bottom: Tabs Section ── */}
        <div className="flex flex-col gap-4" id="pdf-content">
          {/* Tab bar */}
          <ResultTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasResults={hasResults}
          />

          {/* Tab panels */}
          <div
            className="glass-card gradient-border p-5 min-h-[380px]"
            style={{ minHeight: '380px' }}
          >
            {activeTab === 'flowchart' && (
              <FlowchartTab
                flowchart={result.flowchart}
                loading={loading}
              />
            )}
            {activeTab === 'complexity' && (
              <ComplexityTab
                complexity={result.complexity}
                loading={loading}
              />
            )}
            {activeTab === 'optimized' && (
              <OptimizedCodeTab
                optimizedCode={result.optimizedCode}
                language={language}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="text-center py-4">
          <p className="text-xs text-slate-700">
            AI Code Explainer · Built with React, Flask &amp; Groq LLaMA3-70B · 
            <span className="text-brand-800 ml-1">Open Source</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
