import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const NestingPage = lazy(() =>
  import('@sailrite/calc-nesting').then((m) => ({ default: m.NestingPage })),
)
const PillowsPage = lazy(() =>
  import('@sailrite/calc-pillows').then((m) => ({ default: m.PillowsPage })),
)

function PageFallback() {
  return (
    <div className="calc-page" style={{ padding: '1.5rem', color: '#969696' }}>
      Loading calculator…
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/nesting" replace />} />
        <Route path="/nesting" element={<NestingPage />} />
        <Route path="/pillows" element={<PillowsPage />} />
        <Route path="*" element={<Navigate to="/nesting" replace />} />
      </Routes>
    </Suspense>
  )
}
