import { Navigate, Outlet, useLocation } from "react-router-dom"
import RouteLoading from "./RouteLoading"
import { useAuth } from "./useAuth"

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <RouteLoading message="Loading the secure administrator area..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
