import { useLocation } from 'react-router-dom'
import {
  Header,
  HeaderStatusProvider,
  useHeaderStatus,
  SHOP,
} from '@sailrite/calc-shell'
import { CATALOG } from '@sailrite/calc-registry'
import { AppRoutes } from './routes'

function ShellLayout() {
  const { pathname } = useLocation()
  const { status } = useHeaderStatus()

  return (
    <div className="app">
      <Header
        catalog={CATALOG}
        currentPath={pathname}
        status={status}
        shopHref={SHOP.home}
      />
      <AppRoutes />
    </div>
  )
}

export default function App() {
  return (
    <HeaderStatusProvider>
      <ShellLayout />
    </HeaderStatusProvider>
  )
}
