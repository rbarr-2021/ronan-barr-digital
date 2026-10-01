import { Suspense, lazy } from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import AuthProvider from "./components/AuthProvider"
import PublicLayout from "./components/PublicLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./components/AdminLayout"
import RouteLoading from "./components/RouteLoading"
import "./styles/site.css"

const Home = lazy(() => import("./pages/Home"))
const Treatments = lazy(() => import("./pages/Treatments"))
const About = lazy(() => import("./pages/About"))
const AdminLogin = lazy(() => import("./pages/AdminLogin"))
const AdminForgotPassword = lazy(() => import("./pages/AdminForgotPassword"))
const AdminAuthCallback = lazy(() => import("./pages/AdminAuthCallback"))
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminAvailability = lazy(() => import("./pages/admin/AdminAvailability"))
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"))
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"))
const AdminTreatments = lazy(() => import("./pages/admin/AdminTreatments"))

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteLoading message="Loading your page..." />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/auth/callback" element={<AdminAuthCallback />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="availability" element={<AdminAvailability />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="treatments" element={<AdminTreatments />} />
              </Route>
            </Route>

            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/treatments" element={<Treatments />} />
              <Route path="/about" element={<About />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  )
}

export default App
