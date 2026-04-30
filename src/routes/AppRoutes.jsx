import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import ProtectedRoutes from './ProtectedRoutes.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import PublicRoute from './PublicRoute.jsx'
import { useLoader } from '../context/loaderContext/LoaderContext.jsx'

// 🔹 Lazy-loaded pages
const SignIn = lazy(() => import('../pages/auth/LogIn.jsx'))
const SignUp = lazy(() => import('../pages/auth/SignUp.jsx'))
const Confirming = lazy(() => import('../pages/auth/Confirming.jsx'))

const Dashboard = lazy(() => import('../pages/dashboard/index.jsx'))
const Clients = lazy(() => import('../pages/clients/index.jsx'))
const InvoiceList = lazy(() => import('../pages/invoices/InvoiceList.jsx'))
const Invoices = lazy(() => import('../pages/invoices/index.jsx'))
const Projects = lazy(() => import('../pages/projects/index.jsx'))
const PageLoader = () => {
  const { startLoader, stopLoader } = useLoader();

  useEffect(() => {
    startLoader();
    return () => stopLoader();
  }, []);

  return null; // Loader UI is already handled globally
};


const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/confirm" element={<PublicRoute><Confirming /></PublicRoute>} />

        {/* 🔐 Protected layout routes */}
        <Route
  path="/"
  element={
    <ProtectedRoutes>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ProtectedRoutes>
  }
/>

<Route
  path="/dashboard"
  element={
    <ProtectedRoutes>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ProtectedRoutes>
  }
/>

<Route
  path="/clients"
  element={
    <ProtectedRoutes>
      <AppLayout>
        <Clients />
      </AppLayout>
    </ProtectedRoutes>
  }
/>
          
          <Route
            path="/projects"
            element={
              <ProtectedRoutes>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </ProtectedRoutes>
            }
            />

            <Route
  path="/invoices"
  element={
    <ProtectedRoutes>
      <AppLayout>
        <InvoiceList />
      </AppLayout>
    </ProtectedRoutes>
  }
/>

<Route
  path="/invoices/create"
  element={
    <ProtectedRoutes>
      <AppLayout>
        <Invoices />
      </AppLayout>
    </ProtectedRoutes>
  }
/>

<Route
  path="/invoices/:id"
  element={
    <ProtectedRoutes>
      <AppLayout>
        <Invoices />
      </AppLayout>
    </ProtectedRoutes>
  }
/>


        {/* ❌ Fallback */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
