import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  UserRound,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { CLINIC } from '../../lib/constants'
import { Brand } from '../ui/Brand'
import { Avatar } from '../ui/Avatar'
import { buttonStyles } from '../ui/Button'

const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Servicios', to: '/#servicios' },
  { label: 'Médicos', to: '/#medicos' },
  { label: 'Contacto', to: '/#contacto' },
  { label: 'Tecnología', to: '/tech' },
]

export function PublicHeader() {
  const { patient } = useClinic()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  return (
    <>
      <div className="hidden border-b border-white/10 bg-brand-950 text-white/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-2 text-[11px] font-medium lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            {CLINIC.address}
          </span>
          <a
            href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-1.5 transition hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            {CLINIC.phone}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            {CLINIC.hoursShort}
          </span>
          <a
            href={`mailto:${CLINIC.email}`}
            className="ml-auto inline-flex items-center gap-1.5 transition hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            {CLINIC.email}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-8">
          <Link to="/" aria-label="Ir al inicio de Posta Médica Ascarrunz Alto">
            <Brand />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink/60 transition hover:bg-sand hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {patient ? (
              <Link
                to="/mi-cuenta"
                className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink transition hover:border-brand-300"
              >
                <Avatar
                  firstName={patient.firstName || patient.email}
                  lastName={patient.lastNamePaternal}
                  size="sm"
                />
                <span className="max-w-32 truncate">
                  {patient.firstName || 'Mi cuenta'}
                </span>
              </Link>
            ) : (
              <Link to="/login" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Ingresar
              </Link>
            )}
            <Link to="/mi-cuenta/reservar" className={buttonStyles({ size: 'sm' })}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Reservar cita
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div
            id="menu-movil"
            className="border-t border-line bg-paper px-4 pb-5 pt-3 lg:hidden"
          >
            <nav className="flex flex-col" aria-label="Navegación móvil">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-ink/75 transition hover:bg-sand"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
              {patient ? (
                <Link
                  to="/mi-cuenta"
                  className={clsx(buttonStyles({ variant: 'outline', full: true }))}
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Mi cuenta
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={buttonStyles({ variant: 'outline', full: true })}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Ingresar
                </Link>
              )}
              <Link to="/mi-cuenta/reservar" className={buttonStyles({ full: true })}>
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Reservar cita
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
