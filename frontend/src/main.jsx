import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1d27',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: { primary: '#5c7cfa', secondary: '#1a1d27' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#1a1d27' },
        },
      }}
    />
  </React.StrictMode>,
)
