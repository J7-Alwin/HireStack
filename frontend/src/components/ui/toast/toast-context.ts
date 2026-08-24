import { createContext, type ReactNode } from 'react'
import type { ToastType } from './Toast'

export interface ToastOptions {
  readonly title?: string
  readonly message: ReactNode
  readonly type?: ToastType
  readonly duration?: number
}

export interface ToastContextValue {
  readonly showToast: (options: ToastOptions) => string
  readonly dismissToast: (id: string) => void
  readonly success: (message: ReactNode, title?: string) => string
  readonly error: (message: ReactNode, title?: string) => string
  readonly warning: (message: ReactNode, title?: string) => string
  readonly info: (message: ReactNode, title?: string) => string
}

export const ToastContext = createContext<ToastContextValue | null>(null)
