import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function GuestRoute() {
  const {user} = useAuth()
  if (user) {
    return <Navigate to="/home" replace />
  }
  return <Outlet />
}

