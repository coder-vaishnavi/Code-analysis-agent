/**
 * useAnalyze — Custom hook for sending code to Flask backend
 * and managing the full analysis state
 */
import { useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = '/analyze'

const INITIAL_RESULT = {
  explanation:    null,
  flowchart:      null,
  complexity:     null,
  optimizedCode:  null,
}

export function useAnalyze() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [result,  setResult]  = useState(INITIAL_RESULT)

  const analyze = useCallback(async (code, language) => {
    if (!code.trim()) {
      toast.error('Please enter some code first.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(INITIAL_RESULT)

    try {
      const response = await axios.post(
        API_URL,
        { code, language },
        { timeout: 60000 }          // 60s timeout for LLM
      )

      const data = response.data

      // Validate required fields
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server.')
      }

      setResult({
        explanation:   data.explanation   || 'No explanation provided.',
        flowchart:     data.flowchart     || '',
        complexity:    data.complexity    || 'No complexity data.',
        optimizedCode: data.optimized_code || '',
      })

      toast.success('Analysis complete!', { icon: '🎉' })
    } catch (err) {
      console.error('Analysis error:', err)

      let message = 'Something went wrong. Please try again.'

      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        message = 'Cannot connect to backend. Make sure Flask is running on port 5000.'
      } else if (err.response?.status === 429) {
        message = 'Rate limit reached. Please wait a moment and try again.'
      } else if (err.response?.status === 500) {
        message = err.response.data?.error || 'Server error. Check your GROQ_API_KEY.'
      } else if (err.code === 'ECONNABORTED') {
        message = 'Request timed out. The AI took too long to respond.'
      } else if (err.response?.data?.error) {
        message = err.response.data.error
      }

      setError(message)
      toast.error(message, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(INITIAL_RESULT)
    setError(null)
  }, [])

  return { loading, error, result, analyze, reset }
}
