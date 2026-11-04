import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { CLINIC, SERVICES } from '../../lib/constants'
import {
  getDoctorAvailabilityStatus,
  getNextAvailableSlot,
} from '../../lib/availability'
import {
  formatLongDate,
  formatTime12,
  relativeDayLabel,
  todayISO,
} from '../../lib/dates'
import { doctorFullName, patientFullName } from '../../lib/names'
import {
  validateContactInput,
  type FieldErrors,
} from '../../lib/validation'
import type { Doctor } from '../../types'
import type { NextSlot } from '../../lib/availability'
import { Brand } from '../../components/ui/Brand'
import { Avatar } from '../../components/ui/Avatar'
import { SectionHeading } from '../../components/ui/Page'
import { TextAreaField, TextField } from '../../components/ui/Fields'
import { buttonStyles } from '../../components/ui/Button'
import { ServiceIcon } from '../../components/clinic/ServiceIcon'
import { DoctorCard } from '../../components/clinic/DoctorCard'

export function HomePage() {
  const { data, patient, addMessage } = useClinic()
  const toast = useToast()
  const activeDoctors = data.doctors.filter((doctor) => doctor.active)
  const today = todayISO()

  const nextAvailable = useMemo(() => {
    const candidates = activeDoctors
      .map((doctor) => ({
        doctor,
        slot: getNextAvailableSlot({
          schedules: data.schedules,
          appointments: data.appointments,
          doctorId: doctor.id,
        }),
      }))
      .filter(
        (item): item is { doctor: Doctor; slot: NextSlot } => item.slot !== null,
      )
      .sort((a, b) =>
        `${a.slot.date}${a.slot.start}`.localeCompare(
          `${b.slot.date}${b.slot.start}`,
        ),
      )
    return candidates[0] ?? null
  }, [activeDoctors, data.appointments, data.schedules])

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!patient) return
    setForm((current) => ({
      ...current,
      name: current.name || patientFullName(patient),
      email: current.email || patient.email,
      phone: current.phone || patient.phone,
    }))
  }, [patient])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSent(false)
  }

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateContactInput(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const result = addMessage(form)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo enviar el mensaje.', 'error')
      return
    }
    toast('Mensaje enviado. La posta lo revisará en horario de atención.', 'success')
    setForm((current) => ({ ...current, message: '' }))
    setSent(true)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-sand">
        <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent-200/35 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-800 backdrop-blur">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Ascarrunz Alto · San Juan de Lurigancho
            </p>

            <h1 className="mt-6 max-w-2xl font-display text-[3.15rem] font-semibold leading-[0.96] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[4.4rem]">
              Salud cercana,
              <br />
              <span className="italic text-brand-700">citas simples.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-ink/60 sm:text-lg sm:leading-8">
              Reserva con el médico que necesitas y revisa los horarios reales de
              la Posta Médica Ascarrunz Alto. Atención para toda la familia, en tu
              propio distrito.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/mi-cuenta/reservar"
                className={buttonStyles({ size: 'lg' })}
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Reservar mi cita
              </Link>
              <a
                href="#servicios"
                className={buttonStyles({ variant: 'outline', size: 'lg' })}
              >
                Ver servicios
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-ink/55">
              <span className="inline-flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {activeDoctors.length} médicos en atención
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                Lun a sáb · 9:00 a 18:00
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                Confirmación en línea
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up animation-delay-100">
            <div className="absolute -inset-3 rounded-[2.5rem] bg-white/45 blur-xl" aria-hidden="true" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white p-5 shadow-2xl shadow-brand-950/10 sm:p-6">
              <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
                    Disponibilidad
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-ink">
                    {formatLongDate(today)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
                  En vivo
                </span>
              </div>

              {nextAvailable ? (
                <div className="mt-5 rounded-2xl bg-brand-950 p-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-200/80">
                        Próximo cupo disponible
                      </p>
                      <p className="mt-2 font-display text-4xl font-semibold leading-none">
                        {formatTime12(nextAvailable.slot.start)}
                      </p>
                      <p className="mt-2 text-sm text-white/65">
                        {relativeDayLabel(nextAvailable.slot.date)} ·{' '}
                        {doctorFullName(nextAvailable.doctor)}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-brand-100">
                      30 min
                    </span>
                  </div>
                  <Link
                    to={`/mi-cuenta/reservar?doctor=${nextAvailable.doctor.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
                  >
                    Reservar este cupo
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-sand p-5">
                  <p className="font-display text-xl font-semibold text-ink">
                    Agenda en línea
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/55">
                    Revisa los próximos horarios disponibles de cada especialidad.
                  </p>
                  <Link
                    to="/mi-cuenta/reservar"
                    className={buttonStyles({ variant: 'primary', size: 'sm', className: 'mt-4' })}
                  >
                    Ver horarios
                  </Link>
                </div>
              )}

              <div className="mt-5 space-y-2.5">
                {activeDoctors.slice(0, 3).map((doctor) => {
                  const status = getDoctorAvailabilityStatus(
                    {
                      schedules: data.schedules,
                      appointments: data.appointments,
                      doctorId: doctor.id,
                    },
                    doctor.id,
                  )
                  return (
                    <div
                      key={doctor.id}
                      className="flex items-center gap-3 rounded-xl border border-line/70 px-3 py-2.5"
                    >
                      <Avatar
                        firstName={doctor.firstName}
                        lastName={doctor.lastNamePaternal}
                        color={doctor.color}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink">
                          {doctor.prefix} {doctor.firstName} {doctor.lastNamePaternal}
                        </p>
                        <p className="truncate text-[10px] text-ink/45">
                          {doctor.specialty}
                        </p>
                      </div>
                      <span
                        className={
                          status.tone === 'available'
                            ? 'text-[10px] font-bold text-emerald-700'
                            : status.tone === 'soon'
                              ? 'text-[10px] font-bold text-amber-700'
                              : 'text-[10px] font-medium text-ink/35'
                        }
                      >
                        {status.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              <a
                href="#medicos"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 transition hover:text-brand-900"
              >
                Ver todos los médicos y horarios
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="absolute -bottom-5 -right-3 hidden items-center gap-2.5 rounded-2xl border border-line bg-paper px-4 py-3 shadow-xl shadow-brand-950/5 sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                  Atención primaria
                </p>
                <p className="text-xs font-bold text-ink">Cerca de tu casa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="scroll-mt-24 bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              eyebrow="Servicios"
              title={
                <>
                  Atención para cada
                  <br className="hidden sm:block" /> etapa de la familia.
                </>
              }
              description="Cuatro especialidades de atención primaria con horarios definidos. Elige el servicio y reserva con el médico disponible."
            />
            <p className="max-w-xs text-sm leading-6 text-ink/50 lg:text-right">
              ¿No encuentras lo que buscas? Escríbenos desde la sección de
              contacto y te orientamos.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SERVICES.map((service, index) => (
              <article
                key={service.id}
                className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                    <ServiceIcon name={service.icon} />
                  </span>
                  <span className="font-display text-3xl font-medium italic text-line">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight text-ink">
                  {service.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink/55">
                  {service.description}
                </p>
                <Link
                  to={`/mi-cuenta/reservar?especialidad=${encodeURIComponent(service.specialty)}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 transition group-hover:gap-2.5"
                >
                  Reservar cita
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="medicos"
        className="scroll-mt-24 border-y border-line bg-sand/60 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Nuestro equipo"
              title="Médicos con nombre y horario."
              description="Revisa la especialidad, los días de atención y el próximo cupo disponible antes de reservar."
            />
            <Link
              to="/mi-cuenta/reservar"
              className={buttonStyles({ variant: 'outline', size: 'md' })}
            >
              Ver agenda completa
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {activeDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                schedules={data.schedules}
                appointments={data.appointments}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeading
              eyebrow="Cómo funciona"
              title="Tres pasos, sin llamadas."
              description="La disponibilidad se calcula con los horarios asignados a cada médico y las citas ya reservadas."
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  number: '01',
                  title: 'Elige especialidad',
                  text: 'Filtra por médico y revisa su agenda real.',
                },
                {
                  number: '02',
                  title: 'Toma un cupo',
                  text: 'Solo verás horarios libres de 30 minutos.',
                },
                {
                  number: '03',
                  title: 'Confirma y listo',
                  text: 'Llega 10 minutos antes con tu DNI.',
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="border-t border-line pt-5"
                >
                  <p className="font-display text-3xl font-medium italic text-brand-600">
                    {step.number}
                  </p>
                  <h3 className="mt-3 text-sm font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-ink/50">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        className="relative scroll-mt-24 overflow-hidden bg-brand-950 py-20 text-white sm:py-24"
      >
        <div className="dot-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-700/50 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-300">
              Contacto
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Estamos en
              <br />
              <span className="italic text-brand-200">Ascarrunz Alto.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">
              Escríbenos si tienes dudas sobre horarios, documentos o atención.
              También puedes acercarte a la posta en el horario de atención.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <MapPin className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  Dirección
                </p>
                <p className="mt-1 text-sm leading-6 text-white/80">{CLINIC.address}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Clock className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  Horario
                </p>
                <p className="mt-1 text-sm leading-6 text-white/80">{CLINIC.hours}</p>
              </div>
              <a
                href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/25 hover:bg-white/10"
              >
                <Phone className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  Teléfono
                </p>
                <p className="mt-1 text-sm font-semibold text-white/90">{CLINIC.phone}</p>
              </a>
              <a
                href={`mailto:${CLINIC.email}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/25 hover:bg-white/10"
              >
                <Mail className="h-5 w-5 text-brand-300" aria-hidden="true" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  Correo
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-white/90">
                  {CLINIC.email}
                </p>
              </a>
            </div>

            <a
              href={CLINIC.mapUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({
                variant: 'inverse',
                size: 'md',
                className: 'mt-5',
              })}
            >
              Ver ubicación en el mapa
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-paper p-5 text-ink shadow-2xl shadow-black/20 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  Déjanos tu consulta
                </h3>
                <p className="mt-1 text-xs text-ink/50">
                  Respondemos en horario de atención.
                </p>
              </div>
            </div>

            {sent && (
              <div
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
                role="status"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Mensaje recibido. Puedes revisar el estado desde el panel de la posta.
              </div>
            )}

            <form className="mt-5 grid gap-4" onSubmit={handleContact} noValidate>
              <TextField
                label="Nombres y apellidos"
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                error={errors.name}
                placeholder="Ej. Ana Pérez"
                autoComplete="name"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Correo"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  error={errors.email}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                />
                <TextField
                  label="Teléfono (opcional)"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  error={errors.phone}
                  placeholder="9XXXXXXXX"
                  autoComplete="tel"
                />
              </div>
              <TextAreaField
                label="Mensaje"
                required
                rows={4}
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                error={errors.message}
                placeholder="Cuéntanos qué necesitas saber."
                maxLength={600}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xs text-[10px] leading-4 text-ink/40">
                  Usamos tus datos solo para responder esta consulta.
                </p>
                <button type="submit" className={buttonStyles({ size: 'md' })}>
                  Enviar mensaje
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-paper py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div className="flex items-center gap-3">
            <Brand compact />
            <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-ink">Atención con cita previa</p>
              <p className="text-xs text-ink/45">Lun – Sáb · 9:00 a 18:00</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-ink/50">
            <span className="inline-flex items-center gap-1.5">
              <UsersRound className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {activeDoctors.length} médicos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              30 min por cita
            </span>
            <Link to="/mi-cuenta/reservar" className={buttonStyles({ size: 'md' })}>
              Reservar cita
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
