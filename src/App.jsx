import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import LandingPage from './pages/LandingPage'
import {Toaster} from 'sonner'

//auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

//student pages
import MenuPage from "./pages/student/MenuPage"
import CartPage from "./pages/student/CartPage"
import OrdersPage from "./pages/student/OrdersPage"
import OrderTrackingPage from "./pages/student/OrderTrackingPage"

//owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard"


//protected route wrapper 
function ProtectedRoute({children, role}){
  const {user, loading}= useAuth()
  if(loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )

  if(!user) return <Navigate to='/login'/>
  if(role && user.role!==role) return <Navigate to='/' />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* student routes */}
      <Route path="/menu" element={
        <ProtectedRoute role="student">
          <MenuPage />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute role="student">
          <CartPage />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute role="student">
          <OrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute role="student">
          <OrderTrackingPage />
        </ProtectedRoute>
      } />

      {/* owner routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="owner">
          <OwnerDashboard />
        </ProtectedRoute>
      } />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}