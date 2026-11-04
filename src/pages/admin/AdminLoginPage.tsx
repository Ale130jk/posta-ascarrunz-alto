import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessagesSquare,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { Brand } from '../../components/ui/Brand'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Fields'
import { CLINIC } from '../../lib/constants'
import { todayISO } from '../../lib/dates'

function safeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value
  return '/admin'
}

export function AdminLoginPage() {
  const { data, isAdmin, adminLogin } = useClinic()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const next = safeNext(searchParams.get('next'))

  const [email, setEmail] = useState<string>(CLINIC.adminEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAdmin) return <Navigate to={next} replace />

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }
    setSubmitting(true)
    const result = adminLogin(email, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'No se pudo iniciar sesión.')
      return
    }
    toast('Bienvenido al panel de la posta.', 'success')
    navigate(next)
  }

  const fillDemo = () => {
    setEmail(CLINIC.adminEmail)
    setPassword(CLINIC.adminPassword)
    setError('')
  }

  const todayAppointments = data.appointments.filter(
    (appointment) =>
      appointment.date === todayISO() &&
      appointment.status === 'confirmed',
  ).length

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-brand-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="dot-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-brand-700/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between">
          <Brand inverted />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Sitio público
          </Link>
        </div>

        <div className="relative my-auto max-w-lg">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-300">
            Panel administrativo
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] xl:text-6xl">
            La posta,
            <br />
            <span className="italic text-brand-200">ordenada.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            Gestiona doctores, asigna horarios y revisa las citas de Ascarrunz
            Alto desde un solo lugar.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              {
                icon: UsersRound,
                value: data.doctors.length,
                label: 'Doctores',
              },
              {
                icon: CalendarRange,
                value: todayAppointments,
                label: 'Citas hoy',
              },
              {
                icon: MessagesSquare,
                value: data.messages.filter((message) => !message.read).length,
                label: 'Mensajes',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3.5"
                >
                  <Icon className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl font-semibold">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                    {item.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <p className="relative text-[10px] leading-5 text-white/35">
          Acceso reservado al personal autorizado de la Posta Médica Ascarrunz
          Alto. No compartas tus credenciales.
        </p>
      </div>

      <main
        id="contenido-principal"
        className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between lg:hidden">
            <Brand compact />
            <Link
              to="/"
              className="text-xs font-bold text-brand-700 hover:text-brand-900"
            >
              Volver al sitio
            </Link>
          </div>

          <div className="mt-8 lg:mt-0">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/15">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
              Personal de la posta
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.03em] text-ink">
              Ingresa al panel.
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              Administra la agenda y la información de la posta. Solo para
              personal autorizado.
            </p>
          </div>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Correo administrativo"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              placeholder="admin@postaascarrunz.pe"
              autoComplete="username"
            />
            <div className="relative">
              <TextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2 top-[2.15rem] grid h-8 w-8 place-items-center rounded-full text-ink/40 transition hover:bg-sand hover:text-ink"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <Button type="submit" full size="lg" loading={submitting}>
              Ingresar al panel
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-5 rounded-2xl border border-dashed border-line bg-sand/60 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">Acceso de demostración</p>
                <p className="mt-1 break-all text-[11px] leading-5 text-ink/50">
                  {CLINIC.adminEmail}
                  <br />
                  {CLINIC.adminPassword}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="mt-3 text-[11px] font-bold text-brand-700 hover:text-brand-900"
            >
              Autocompletar credenciales
            </button>
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-white p-3.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <p className="text-[11px] leading-5 text-ink/45">
              ¿Problemas para ingresar? Contacta a la administración de la posta
              al {CLINIC.phone}.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
