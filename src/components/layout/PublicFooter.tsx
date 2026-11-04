import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { CLINIC } from '../../lib/constants'
import { Brand } from '../ui/Brand'

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <Brand />
          <p className="mt-5 max-w-xs text-sm leading-6 text-ink/55">
            Atención primaria para las familias de Ascarrunz Alto y San Juan de
            Lurigancho. Agenda en línea, horarios claros.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Cuidado cerca de casa
          </p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/65">
            <li>
              <Link to="/" className="transition hover:text-brand-700">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/#servicios" className="transition hover:text-brand-700">
                Servicios
              </Link>
            </li>
            <li>
              <Link to="/#medicos" className="transition hover:text-brand-700">
                Nuestros médicos
              </Link>
            </li>
            <li>
              <Link to="/#contacto" className="transition hover:text-brand-700">
                Contacto
              </Link>
            </li>
            <li>
              <Link to="/mi-cuenta" className="transition hover:text-brand-700">
                Mi cuenta
              </Link>
            </li>
            <li>
              <Link to="/tech" className="transition hover:text-brand-700">
                Dossier técnico
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
            Servicios
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/65">
            <li>Medicina general</li>
            <li>Pediatría</li>
            <li>Obstetricia</li>
            <li>Odontología</li>
            <li>Enfermería y nutrición</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink/65">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>{CLINIC.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="hover:text-brand-700">
                {CLINIC.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={`mailto:${CLINIC.email}`} className="break-all hover:text-brand-700">
                {CLINIC.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>{CLINIC.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-ink/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Posta Médica Ascarrunz Alto. San Juan de Lurigancho, Lima.</p>
          <div className="flex items-center gap-4">
            <span>Atención con cita previa</span>
            <Link to="/admin/login" className="font-semibold text-ink/55 hover:text-brand-700">
              Acceso administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
