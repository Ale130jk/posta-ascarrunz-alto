import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useClinic } from '../../context/ClinicContext'
import { isProfileComplete } from '../../lib/validation'

export function PatientRoute() {
  const { patient, session } = useClinic()
  const location = useLocation()
  const next = encodeURIComponent(`${location.pathname}${location.search}`)

  if (!session.patientId || !patient) {
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (!isProfileComplete(patient)) {
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { isAdmin } = useClinic()
  const location = useLocation()
  const next = encodeURIComponent(`${location.pathname}${location.search}`)

  if (!isAdmin) {
    return <Navigate to={`/admin/login?next=${next}`} replace />
  }

  return <Outlet />
}
