import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import { AuthProvider } from './context/authContext/AuthContext.jsx'
import {LoaderProvider} from './context/loaderContext/LoaderContext.jsx'
import { ToastProvider } from './context/toastContext/ToastContext.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoaderProvider>
          <ToastProvider> 
            <AppRoutes />
          </ToastProvider>
      </LoaderProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
