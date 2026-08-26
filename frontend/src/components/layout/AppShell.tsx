import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNavigation } from './MobileNavigation'
import { Topbar } from './Topbar'

export interface AppShellProps {
  readonly children?: ReactNode
}

/**
 * AppShell
 *
 * Primary application layout frame for authenticated users.
 * Houses the desktop sidebar, mobile navigation drawer, topbar, and main content area.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="hs-app-shell">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileNavigation />

      {/* Main Area */}
      <div className="hs-main-area">
        <Topbar />
        {children ? children : <Outlet />}
      </div>
    </div>
  )
}
