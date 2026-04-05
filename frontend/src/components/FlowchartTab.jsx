/**
 * FlowchartTab — Renders Mermaid.js flowchart from AI-generated graph syntax
 */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import mermaid from 'mermaid'
import { Share2, Download, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  darkMode: true,
  themeVariables: {
    primaryColor: '#4c6ef5',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#748ffc',
    lineColor: '#748ffc',
    secondaryColor: '#1a1d27',
    tertiaryColor: '#21253a',
    background: '#13151c',
    mainBkg: '#1a1d27',
    nodeBorder: '#4c6ef5',
    clusterBkg: '#21253a',
    titleColor: '#e2e8f0',
    edgeLabelBackground: '#21253a',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '13px',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
    useMaxWidth: true,
  },
})

let diagramCounter = 0

export default function FlowchartTab({ flowchart, loading }) {
  const containerRef = useRef(null)
  const [renderError, setRenderError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [rendered, setRendered] = useState(false)

  const renderDiagram = useCallback(async () => {
    if (!containerRef.current || !flowchart) return
    setRenderError(null)
    setRendered(false)

    try {
      // Sanitize the flowchart string
      let chart = flowchart.trim()
      // Ensure it starts with a valid graph declaration
      if (!chart.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie)/i)) {
        chart = `graph TD\n${chart}`
      }
      // Remove any markdown code fences
      chart = chart.replace(/```mermaid\n?/gi, '').replace(/```\n?/gi, '')

      const id = `mermaid-${++diagramCounter}`
      const { svg } = await mermaid.render(id, chart)
      if (containerRef.current) {
        containerRef.current.innerHTML = svg
        setRendered(true)
      }
    } catch (err) {
      console.error('Mermaid error:', err)
      setRenderError('Could not render flowchart. The AI may have returned an invalid diagram.')
    }
  }, [flowchart])

  useEffect(() => {
    if (flowchart && !loading) {
      renderDiagram()
    }
  }, [flowchart, loading, renderDiagram])

  async function handleDownload() {
    if (!containerRef.current) return
    const svg = containerRef.current.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowchart.svg'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Flowchart downloaded!')
  }

  async function handleCopySource() {
    await navigator.clipboard.writeText(flowchart || '')
    toast.success('Mermaid source copied!')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 size={14} className="text-brand-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Flow Diagram</span>
          {rendered && (
            <span className="badge bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              ✓ Rendered
            </span>
          )}
        </div>

        {flowchart && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="btn-secondary !px-2 !py-1.5">
              <ZoomIn size={13} />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="btn-secondary !px-2 !py-1.5">
              <ZoomOut size={13} />
            </button>
            <button onClick={() => setZoom(1)} className="btn-secondary !px-2 !py-1.5">
              <RotateCcw size={13} />
            </button>
            <button onClick={handleCopySource} className="btn-secondary !px-3 !py-1.5 !text-xs">
              Copy Source
            </button>
            <button onClick={handleDownload} className="btn-secondary !px-3 !py-1.5 !text-xs">
              <Download size={12} />
              SVG
            </button>
          </div>
        )}
      </div>

      {/* Chart area */}
      <div className="flex-1 glass-card border border-white/5 rounded-xl overflow-auto flex items-start justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 rounded-full bg-brand-500 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">Generating flowchart...</p>
          </div>
        ) : renderError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle size={36} className="text-amber-500" />
            <p className="text-sm font-medium text-amber-400">Render Error</p>
            <p className="text-xs text-slate-500 max-w-xs">{renderError}</p>
            {flowchart && (
              <pre className="mt-4 text-xs text-left text-slate-500 bg-surface-700/50 p-3 rounded-lg max-w-sm overflow-x-auto">
                {flowchart.slice(0, 200)}
              </pre>
            )}
          </div>
        ) : !flowchart ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-white/5 flex items-center justify-center">
              <Share2 size={28} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">Flowchart will appear here after analysis</p>
          </div>
        ) : (
          <div
            className="mermaid-wrapper transition-transform duration-300 animate-in"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            ref={containerRef}
          />
        )}
      </div>

      {/* Mermaid source preview */}
      {flowchart && !loading && (
        <div className="mt-3 p-3 rounded-xl bg-surface-800/50 border border-white/5">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">Mermaid Source</p>
          <pre className="text-xs text-slate-500 overflow-x-auto font-mono leading-relaxed">
            {flowchart.slice(0, 300)}{flowchart.length > 300 ? '...' : ''}
          </pre>
        </div>
      )}
    </div>
  )
}
