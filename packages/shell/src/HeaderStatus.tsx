import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type SetHeaderStatus = (node: ReactNode) => void

const HeaderStatusStateContext = createContext<ReactNode>(null)
const HeaderSetStatusContext = createContext<SetHeaderStatus | null>(null)

export function HeaderStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<ReactNode>(null)
  // Stable setter — calculators may safely depend on this in useEffect deps
  // without re-firing when status itself changes.
  const setStatus = useCallback<SetHeaderStatus>((node) => {
    setStatusState(node)
  }, [])

  return (
    <HeaderSetStatusContext.Provider value={setStatus}>
      <HeaderStatusStateContext.Provider value={status}>
        {children}
      </HeaderStatusStateContext.Provider>
    </HeaderSetStatusContext.Provider>
  )
}

export function useHeaderStatus() {
  const setStatus = useContext(HeaderSetStatusContext)
  const status = useContext(HeaderStatusStateContext)
  if (!setStatus) {
    throw new Error('useHeaderStatus must be used within HeaderStatusProvider')
  }
  return { status, setStatus }
}

/**
 * Optional hook for calculator pages.
 * Prefer depending on `setStatus` (stable) in effects — never the whole return
 * object — or status updates will infinite-loop.
 */
export function useHeaderStatusOptional() {
  const setStatus = useContext(HeaderSetStatusContext)
  const status = useContext(HeaderStatusStateContext)
  if (!setStatus) return null
  return { status, setStatus }
}
