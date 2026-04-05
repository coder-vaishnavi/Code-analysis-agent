/**
 * CodeEditor — Monaco Editor wrapper with language selector and toolbar
 */
import React, { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Code2, ChevronDown, Play, RotateCcw } from 'lucide-react'

const LANGUAGES = [
  { id: 'python',     label: 'Python',     icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'java',       label: 'Java',       icon: '☕' },
  { id: 'cpp',        label: 'C++',        icon: '⚙️' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'go',         label: 'Go',         icon: '🐹' },
  { id: 'rust',       label: 'Rust',       icon: '🦀' },
]

const SAMPLE_CODE = {
  python: `def binary_search(arr, target):
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
print(f"Found at index: {result}")`,

  javascript: `function quickSort(arr) {
  // Base case: arrays with 0 or 1 element are sorted
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left   = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right  = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

const nums = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted:", quickSort(nums));`,

  java: `public class Fibonacci {
    // Memoized fibonacci using dynamic programming
    private static Map<Integer, Long> memo = new HashMap<>();

    public static long fib(int n) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) return memo.get(n);

        long result = fib(n - 1) + fib(n - 2);
        memo.put(n, result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println("Fibonacci(10) = " + fib(10));
        System.out.println("Fibonacci(50) = " + fib(50));
    }
}`,

  cpp: `#include <iostream>
#include <vector>
using namespace std;

// Merge sort implementation — O(n log n)
void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;

    while (i < left.size() && j < right.size()) {
        arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = (l + r) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    return 0;
}`,
}

export default function CodeEditor({ code, language, onCodeChange, onLanguageChange, onAnalyze, loading }) {
  const editorRef = useRef(null)
  const [langOpen, setLangOpen] = React.useState(false)

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]

  function handleEditorMount(editor) {
    editorRef.current = editor
    editor.focus()
  }

  function handleLoadSample() {
    const sample = SAMPLE_CODE[language] || SAMPLE_CODE.python
    onCodeChange(sample)
  }

  function handleReset() {
    onCodeChange('')
    if (editorRef.current) editorRef.current.focus()
  }

  return (
    <div className="flex flex-col h-full glass-card gradient-border overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-surface-900/40">
        {/* Left: icon + label */}
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-brand-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
            Code Input
          </span>
        </div>

        {/* Right: language picker + actions */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 border border-white/8 text-xs font-medium text-slate-200 hover:bg-surface-600 transition-colors"
            >
              <span>{currentLang.icon}</span>
              <span>{currentLang.label}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 py-1 rounded-xl bg-surface-700 border border-white/8 shadow-card z-50 animate-in">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      onLanguageChange(lang.id)
                      setLangOpen(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors
                      ${lang.id === language
                        ? 'text-brand-300 bg-brand-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-surface-600'
                      }`}
                  >
                    <span>{lang.icon}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Load sample */}
          <button
            onClick={handleLoadSample}
            className="btn-secondary !px-2.5 !py-1.5 !text-xs"
            title="Load sample code"
          >
            <span>Sample</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="btn-secondary !px-2 !py-1.5"
            title="Clear editor"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={val => onCodeChange(val || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13.5,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            padding: { top: 16, bottom: 16 },
            wordWrap: 'on',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'gutter',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
            formatOnPaste: true,
            suggest: { preview: true },
          }}
        />
      </div>

      {/* ── Analyze Button ── */}
      <div className="px-4 py-3 border-t border-white/5 bg-surface-900/40">
        <button
          onClick={onAnalyze}
          disabled={loading || !code.trim()}
          className={`btn-primary w-full justify-center py-3 text-sm font-semibold rounded-xl
            ${(loading || !code.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white relative z-10" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="relative z-10">AI is analyzing...</span>
            </>
          ) : (
            <>
              <Play size={15} strokeWidth={2.5} className="relative z-10" />
              <span className="relative z-10">Analyze with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
