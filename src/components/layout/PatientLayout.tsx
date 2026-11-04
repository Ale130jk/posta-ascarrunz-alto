import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CalendarPlus,
  House,
  LayoutDashboard,
  LogOut,
  UserRound,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { Brand } from '../ui/Brand'
import { Avatar } from '../ui/Avatar'

const navItems = [
  { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/mi-cuenta/reservar', label: 'Reservar cita', icon: CalendarPlus },
  { to: '/mi-cuenta/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/mi-cuenta/perfil', label: 'Mis datos', icon: UserRound },
]

export function PatientLayout() {
  const { patient, logoutPatient } = useClinic()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logoutPatient()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/mi-cuenta" aria-label="Ir a mi cuenta">
            <Brand compact />
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full border border-line bg-white p-1 md:flex"
            aria-label="Navegación de mi cuenta"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition',
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-ink/55 hover:bg-sand hover:text-ink',
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden rounded-full p-2 text-ink/50 transition hover:bg-sand hover:text-ink sm:grid"
              aria-label="Volver al sitio público"
            >
              <House className="h-5 w-5" aria-hidden="true" />
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 sm:flex">
              <Avatar
                firstName={patient?.firstName || patient?.email || 'P'}
                lastName={patient?.lastNamePaternal}
                size="sm"
              />
              <div className="max-w-32 leading-tight">
                <p className="truncate text-xs font-bold text-ink">
                  {patient?.firstName || 'Paciente'}
                </p>
                <p className="truncate text-[10px] text-ink/45">{patient?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink/50 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main
        id="contenido-principal"
        key={location.pathname}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-8"
      >
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Navegación móvil de mi cuenta"
      >
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-bold transition',
                    isActive ? 'text-brand-700' : 'text-ink/40',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
