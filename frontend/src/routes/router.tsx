import { createBrowserRouter } from 'react-router-dom'
import { FoundationRoot } from './FoundationRoot'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FoundationRoot />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
