import { createBrowserRouter } from 'react-router-dom'
import { FoundationRoot } from './FoundationRoot'
import { NotFoundPage } from './NotFoundPage'
import { ForbiddenPage } from './ForbiddenPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { LoginPage } from '@/features/auth'
import { AppShell, PageContainer } from '@/components/layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FoundationRoot />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PageContainer>
            <FoundationRoot />
          </PageContainer>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])


