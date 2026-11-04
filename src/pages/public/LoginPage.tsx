import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { Avatar } from '../../components/ui/Avatar'
import { Brand } from '../../components/ui/Brand'
import { TextField } from '../../components/ui/Fields'
import { buttonStyles } from '../../components/ui/Button'
import { CLINIC } from '../../lib/constants'
import {
  isProfileComplete,
  isValidEmail,
  validatePatientProfile,
  type FieldErrors,
} from '../../lib/validation'
import type { PatientProfileInput } from '../../types'

const emptyProfile: PatientProfileInput = {
  firstName: '',
  lastNamePaternal: '',
  lastNameMaternal: '',
  dni: '',
  phone: '',
}

function safeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value
  return '/mi-cuenta'
}

export function LoginPage() {
  const { patient, loginPatient, updatePatientProfile, logoutPatient } = useClinic()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const next = safeNext(searchParams.get('next'))

  const [step, setStep] = useState<'email' | 'profile'>(
    patient && !isProfileComplete(patient) ? 'profile' : 'email',
  )
  const [email, setEmail] = useState(patient?.email ?? '')
  const [profile, setProfile] = useState<PatientProfileInput>({
    firstName: patient?.firstName ?? '',
    lastNamePaternal: patient?.lastNamePaternal ?? '',
    lastNameMaternal: patient?.lastNameMaternal ?? '',
    dni: patient?.dni ?? '',
    phone: patient?.phone ?? '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState('')

  const handleEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError('')
    if (!isValidEmail(email)) {
      setErrors({ email: 'Ingresa un correo electrónico válido.' })
      return
    }
    setErrors({})
    const result = loginPatient(email)
    if (!result.ok || !result.patient) {
      setGeneralError(result.error ?? 'No se pudo iniciar sesión.')
      return
    }
    if (result.needsProfile) {
      setProfile({
        firstName: result.patient.firstName,
        lastNamePaternal: result.patient.lastNamePaternal,
        lastNameMaternal: result.patient.lastNameMaternal,
        dni: result.patient.dni,
        phone: result.patient.phone,
      })
      setStep('profile')
      toast('Correo verificado. Completa tus datos para reservar.', 'success')
      return
    }
    navigate(next)
  }

  const handleProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError('')
    const nextErrors = validatePatientProfile(profile)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const result = updatePatientProfile(profile)
    if (!result.ok) {
      setGeneralError(result.error ?? 'No se pudieron guardar tus datos.')
      return
    }
    toast('Datos guardados. Ya puedes reservar tu cita.', 'success')
    navigate(next)
  }

  const handleChangeEmail = () => {
    logoutPatient()
    setStep('email')
    setProfile(emptyProfile)
    setErrors({})
    setGeneralError('')
  }

  if (patient && isProfileComplete(patient) && step !== 'profile') {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="rounded-[2rem] border border-line bg-white p-7 text-center shadow-xl shadow-brand-900/5 sm:p-10">
          <div className="mx-auto flex justify-center">
            <Avatar
              firstName={patient.firstName}
              lastName={patient.lastNamePaternal}
              size="xl"
            />
          </div>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
            Sesión activa
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Hola, {patient.firstName}.
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            Ya iniciaste sesión con <strong className="text-ink/75">{patient.email}</strong>.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to={next} className={buttonStyles({ size: 'lg' })}>
              Continuar a mi cuenta
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleChangeEmail}
              className={buttonStyles({ variant: 'outline', size: 'lg' })}
            >
              Usar otro correo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-0 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:py-20">
      <div className="relative hidden overflow-hidden rounded-l-[2rem] bg-brand-950 p-10 text-white lg:flex lg:flex-col">
        <div className="dot-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-700/50 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <Brand inverted />
          <p className="mt-16 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-300">
            Reserva en línea
          </p>
          <h1 className="mt-4 font-display text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.04em]">
            Tu salud,
            <br />
            <span className="italic text-brand-200">en tu horario.</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            Ingresa con tu correo para ver tu agenda, reservar con el médico que
            necesitas y gestionar tus citas en la Posta Médica Ascarrunz Alto.
          </p>
        </div>

        <div className="relative mt-auto space-y-4 pt-12">
          {[
            {
              icon: CalendarCheck,
              title: 'Cupos reales',
              text: 'La agenda cruza horarios de médicos y citas ocupadas.',
            },
            {
              icon: ShieldCheck,
              title: 'Tus datos protegidos',
              text: 'DNI validado y usado solo para tu atención.',
            },
            {
              icon: Clock,
              title: 'Cancelación clara',
              text: 'Puedes cancelar hasta 24 horas antes de la cita.',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-brand-200">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/50">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-line bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-9 lg:rounded-l-none lg:border-l-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
              {step === 'email' ? 'Paciente' : 'Tus datos'}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              {step === 'email' ? 'Ingresa a tu cuenta' : 'Completa tu perfil'}
            </h2>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700">
            {step === 'email' ? (
              <Mail className="h-5 w-5" aria-hidden="true" />
            ) : (
              <UserRound className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2" aria-label="Progreso del registro">
          <span
            className={`h-1.5 flex-1 rounded-full ${step === 'email' ? 'bg-brand-600' : 'bg-brand-600'}`}
          />
          <span
            className={`h-1.5 flex-1 rounded-full ${step === 'profile' ? 'bg-brand-600' : 'bg-line'}`}
          />
        </div>

        {step === 'email' ? (
          <>
            <p className="mt-5 text-sm leading-6 text-ink/55">
              No necesitas contraseña. Escribe cualquier correo válido y lo usaremos
              para identificar tus reservas.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleEmail} noValidate>
              <TextField
                label="Correo electrónico"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors({})
                  setGeneralError('')
                }}
                error={errors.email}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
                hint="Ejemplo de prueba: maria.fernandez@example.com"
              />
              {generalError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
                >
                  {generalError}
                </p>
              )}
              <button type="submit" className={buttonStyles({ full: true, size: 'lg' })}>
                Continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setEmail('maria.fernandez@example.com')}
              className="mt-3 w-full rounded-xl border border-dashed border-line bg-sand/50 px-3 py-2.5 text-left text-xs text-ink/50 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="font-bold text-ink/65">Acceso de demostración:</span>{' '}
              usar maria.fernandez@example.com
            </button>

            <div className="mt-6 border-t border-line pt-5 text-xs leading-5 text-ink/45">
              <p>
                ¿Eres personal de la posta?{' '}
                <Link to="/admin/login" className="font-bold text-brand-700 hover:text-brand-900">
                  Ingresa al panel administrativo
                </Link>
                .
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-3.5 py-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-brand-700">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-brand-900">
                {email || patient?.email}
              </p>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700 hover:text-brand-900"
              >
                Cambiar
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleProfile} noValidate>
              <TextField
                label="Nombres"
                required
                autoFocus
                value={profile.firstName}
                onChange={(event) => {
                  setProfile((current) => ({ ...current, firstName: event.target.value }))
                  setErrors((current) => ({ ...current, firstName: '' }))
                  setGeneralError('')
                }}
                error={errors.firstName}
                placeholder="Ej. María Fernanda"
                autoComplete="given-name"
                hint="Solo letras, tildes y espacios."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Apellido paterno"
                  required
                  value={profile.lastNamePaternal}
                  onChange={(event) => {
                    setProfile((current) => ({
                      ...current,
                      lastNamePaternal: event.target.value,
                    }))
                    setErrors((current) => ({ ...current, lastNamePaternal: '' }))
                  }}
                  error={errors.lastNamePaternal}
                  placeholder="Ej. Fernández"
                  autoComplete="family-name"
                />
                <TextField
                  label="Apellido materno"
                  required
                  value={profile.lastNameMaternal}
                  onChange={(event) => {
                    setProfile((current) => ({
                      ...current,
                      lastNameMaternal: event.target.value,
                    }))
                    setErrors((current) => ({ ...current, lastNameMaternal: '' }))
                  }}
                  error={errors.lastNameMaternal}
                  placeholder="Ej. Rojas"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="DNI"
                  required
                  inputMode="numeric"
                  maxLength={8}
                  value={profile.dni}
                  onChange={(event) => {
                    setProfile((current) => ({ ...current, dni: event.target.value }))
                    setErrors((current) => ({ ...current, dni: '' }))
                  }}
                  error={errors.dni}
                  placeholder="8 dígitos"
                  autoComplete="off"
                  hint="Exactamente 8 dígitos numéricos."
                />
                <TextField
                  label="Celular"
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={9}
                  value={profile.phone}
                  onChange={(event) => {
                    setProfile((current) => ({ ...current, phone: event.target.value }))
                    setErrors((current) => ({ ...current, phone: '' }))
                  }}
                  error={errors.phone}
                  placeholder="9XXXXXXXX"
                  autoComplete="tel"
                  hint="9 dígitos, sin espacios."
                />
              </div>

              {generalError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
                >
                  {generalError}
                </p>
              )}

              <button type="submit" className={buttonStyles({ full: true, size: 'lg' })}>
                Guardar y continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-center text-[10px] leading-4 text-ink/40">
                Usamos tu DNI y teléfono para identificarte en la posta. No se
                comparten con terceros.
              </p>
            </form>
          </>
        )}

        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-sand/70 p-3.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <p className="text-[11px] leading-5 text-ink/50">
            Atención en {CLINIC.address}. Si necesitas ayuda, llama al{' '}
            <a
              href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}
              className="font-bold text-brand-700"
            >
              {CLINIC.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
