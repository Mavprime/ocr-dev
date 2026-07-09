import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { LanguageProvider } from './components/LanguageProvider.tsx'
import { AuthProvider } from './components/AuthProvider.tsx'
import './index.css'

//#region debug-point white-screen-ui-root
class DebugErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    }
  }

  componentDidCatch(error: unknown) {
    const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    document.documentElement.setAttribute('data-debug-react-error', msg)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: '16px',
            zIndex: 99999,
            overflow: 'auto',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            background: 'rgba(15, 23, 42, 0.96)',
            color: '#f8fafc',
            padding: '16px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            whiteSpace: 'pre-wrap',
          }}
        >
          React render error:
          {'\n'}
          {this.state.error}
        </div>
      )
    }

    return this.props.children
  }
}

window.addEventListener('error', (event) => {
  document.documentElement.setAttribute(
    'data-debug-window-error',
    event.error instanceof Error ? `${event.error.name}: ${event.error.message}` : String(event.message),
  )
})

window.addEventListener('unhandledrejection', (event) => {
  document.documentElement.setAttribute(
    'data-debug-promise-error',
    event.reason instanceof Error ? `${event.reason.name}: ${event.reason.message}` : String(event.reason),
  )
})

document.documentElement.setAttribute('data-debug-main-loaded', 'true')
//#endregion debug-point white-screen-ui-root

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DebugErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
          <BrowserRouter>
            <App />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3200,
              style: {
                borderRadius: '16px',
                fontSize: '14px',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                background: 'rgba(15, 23, 42, 0.88)',
                color: '#f8fafc',
                backdropFilter: 'blur(14px)',
              },
            }}
          />
          </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </DebugErrorBoundary>
  </React.StrictMode>,
)
