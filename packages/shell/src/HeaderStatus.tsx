import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type HeaderStatusContextValue = {
  status: ReactNode
  setStatus: (node: ReactNode) => void
}

const HeaderStatusContext = createContext<HeaderStatusContextValue | null>(null)

export function HeaderStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<ReactNode>(null)
  const setStatus = useCallback((node: ReactNode) => {
    setStatusState(node)
  }, [])
  const value = useMemo(() => ({ status, setStatus }), [status, setStatus])
  return (
    <HeaderStatusContext.Provider value={value}>{children}</HeaderStatusContext.Provider>
  )
}

export function useHeaderStatus() {
  const ctx = useContext(HeaderStatusContext)
  if (!ctx) {
    throw new Error('useHeaderStatus must be used within HeaderStatusProvider')
  }
  return ctx
}

/** Optional hook — returns null setters when outside provider (tests). */
export function useHeaderStatusOptional() {
  return useContext(HeaderStatusContext)
}
