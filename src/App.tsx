import { lazy, Suspense, useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { ClinicProvider } from './context/ClinicContext'
import { ToastProvider } from './components/ui/Toast'
import { PublicLayout } from './components/layout/PublicLayout'
import { PatientLayout } from './components/layout/PatientLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { SkipLink } from './components/layout/SkipLink'
import { AdminRoute, PatientRoute } from './components/layout/Guards'
import { HomePage } from './pages/public/HomePage'
import { LoginPage } from './pages/public/LoginPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'

const PatientDashboardPage = lazy(() =>
  import('./pages/patient/PatientDashboardPage').then((module) => ({
    default: module.PatientDashboardPage,
  })),
)
const MyAppointmentsPage = lazy(() =>
  import('./pages/patient/MyAppointmentsPage').then((module) => ({
    default: module.MyAppointmentsPage,
  })),
)
const BookAppointmentPage = lazy(() =>
  import('./pages/patient/BookAppointmentPage').then((module) => ({
    default: module.BookAppointmentPage,
  })),
)
const ProfilePage = lazy(() =>
  import('./pages/patient/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const DoctorsPage = lazy(() =>
  import('./pages/admin/DoctorsPage').then((module) => ({
    default: module.DoctorsPage,
  })),
)
const SchedulesPage = lazy(() =>
  import('./pages/admin/SchedulesPage').then((module) => ({
    default: module.SchedulesPage,
  })),
)
const AppointmentsPage = lazy(() =>
  import('./pages/admin/AppointmentsPage').then((module) => ({
    default: module.AppointmentsPage,
  })),
)
const MessagesPage = lazy(() =>
  import('./pages/admin/MessagesPage').then((module) => ({
    default: module.MessagesPage,
  })),
)
const TechPage = lazy(() =>
  import('./pages/public/TechPage').then((module) => ({
    default: module.TechPage,
  })),
)

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}

function RouteLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper">
      <span
        role="status"
        aria-label="Cargando"
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ClinicProvider>
        <ToastProvider>
          <SkipLink />
          <ScrollToTop />
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="tech" element={<TechPage />} />
              </Route>

              <Route path="mi-cuenta" element={<PatientRoute />}>
                <Route element={<PatientLayout />}>
                  <Route index element={<PatientDashboardPage />} />
                  <Route path="reservar" element={<BookAppointmentPage />} />
                  <Route path="citas" element={<MyAppointmentsPage />} />
                  <Route path="perfil" element={<ProfilePage />} />
                </Route>
              </Route>

              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route path="admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="doctores" element={<DoctorsPage />} />
                  <Route path="horarios" element={<SchedulesPage />} />
                  <Route path="citas" element={<AppointmentsPage />} />
                  <Route path="mensajes" element={<MessagesPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </ClinicProvider>
    </BrowserRouter>
  )
}
