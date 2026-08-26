import { type HTMLAttributes, type ReactNode } from 'react'

export type PageContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type PageContainerPadding = 'none' | 'sm' | 'md' | 'lg'

export interface PageContainerProps extends HTMLAttributes<HTMLElement> {
  readonly maxWidth?: PageContainerMaxWidth
  readonly padding?: PageContainerPadding
  readonly children: ReactNode
}

const maxWidthMap: Record<PageContainerMaxWidth, string> = {
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1440px',
  full: '100%',
}

const paddingMap: Record<PageContainerPadding, string> = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
}

export function PageContainer({
  maxWidth = 'xl',
  padding = 'md',
  children,
  className = '',
  style,
  ...props
}: PageContainerProps) {
  return (
    <main
      style={{
        width: '100%',
        maxWidth: maxWidthMap[maxWidth],
        margin: '0 auto',
        padding: paddingMap[padding],
        boxSizing: 'border-box',
        flex: 1,
        ...style,
      }}
      className={`hs-page-container hs-page-container-${maxWidth} ${className}`}
      {...props}
    >
      {children}
    </main>
  )
}
