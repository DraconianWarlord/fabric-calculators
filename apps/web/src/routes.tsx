import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { NestingPage } from '@sailrite/calc-nesting'
import { PillowsPage } from '@sailrite/calc-pillows'

class RouteErrorBoundary extends Component<
  { resetKey: string; children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Calculator route error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="calc-page" style={{ padding: '1.5rem' }} role="alert">
          <p style={{ fontWeight: 700, marginTop: 0 }}>Calculator failed to load.</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#666', fontSize: '0.85rem' }}>
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function RoutedPages() {
  const { pathname } = useLocation()
  return (
    <RouteErrorBoundary resetKey={pathname}>
      <Routes>
        <Route path="/" element={<Navigate to="/nesting" replace />} />
        <Route path="/nesting" element={<NestingPage key={pathname} />} />
        <Route path="/pillows" element={<PillowsPage key={pathname} />} />
        <Route path="*" element={<Navigate to="/nesting" replace />} />
      </Routes>
    </RouteErrorBoundary>
  )
}

export function AppRoutes() {
  return <RoutedPages />
}
