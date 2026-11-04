import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  CalendarDays,
  CalendarRange,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  UsersRound,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { Brand } from '../ui/Brand'

const navItems = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/doctores', label: 'Doctores', icon: UsersRound },
  { to: '/admin/horarios', label: 'Horarios', icon: CalendarRange },
  { to: '/admin/citas', label: 'Citas', icon: ClipboardList },
  { to: '/admin/mensajes', label: 'Mensajes', icon: MessagesSquare },
]

export function AdminLayout() {
  const { data, adminLogout } = useClinic()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const unread = data.messages.filter((message) => !message.read).length

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-950">
      <div className="px-5 pb-6 pt-6">
        <Link to="/admin" aria-label="Ir al panel de administración">
          <Brand inverted />
        </Link>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200/80">
          Panel de gestión
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Navegación del panel">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/55 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.label === 'Mensajes' && unread > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-400 px-1.5 text-[10px] font-extrabold text-brand-950">
                  {unread}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />
          Ver sitio público
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Cerrar sesión
        </button>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-200 text-xs font-extrabold text-brand-900">
            AD
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">Administrador</p>
            <p className="truncate text-[10px] text-white/45">Ascarrunz Alto</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur-md lg:hidden">
          <Link to="/admin">
            <Brand compact />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink"
            aria-label="Abrir menú del panel"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <main
          id="contenido-principal"
          className="mx-auto min-h-screen w-full max-w-7xl p-4 sm:p-6 lg:p-8"
        >
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-ink/45">
              <CalendarDays className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Posta Médica Ascarrunz Alto · San Juan de Lurigancho
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 transition hover:text-brand-900"
            >
              Ver sitio
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[min(18rem,86vw)] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  )
}
