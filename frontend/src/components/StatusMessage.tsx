import type { ReactNode } from 'react'

type StatusMessageProps = {
  children: ReactNode
  kind?: 'loading' | 'error' | 'empty'
}

export function StatusMessage({ children, kind = 'loading' }: StatusMessageProps) {
  return <p className={`status-message ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</p>
}
