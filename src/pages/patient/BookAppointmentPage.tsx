import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { Pill } from '../../components/ui/Badge'
import { Button, buttonStyles } from '../../components/ui/Button'
import { TextAreaField } from '../../components/ui/Fields'
import {
  getAvailableSlots,
  getDoctorAvailabilityStatus,
  summarizeSchedules,
} from '../../lib/availability'
import {
  addDaysISO,
  endOfMonthISO,
  formatLongDate,
  formatTime12,
  isoDate,
  relativeDayLabel,
  startOfMonthISO,
  todayISO,
} from '../../lib/dates'
import { appointmentCode, doctorFullName, patientFullName } from '../../lib/names'
import { calendarPlugins, esLocale } from '../../lib/calendar'
import { validateReason } from '../../lib/validation'
import type { Appointment, Doctor, Slot } from '../../types'

type Step = 1 | 2 | 3

export function BookAppointmentPage() {
  const { data, patient, bookAppointment, rescheduleAppointment } = useClinic()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const requestedDoctorId = searchParams.get('doctor') ?? ''
  const reprogramId = searchParams.get('reprogramar') ?? ''
  const specialtyParam = searchParams.get('especialidad') ?? ''

  const rescheduleTarget = patient
    ? data.appointments.find(
        (appointment) =>
          appointment.id === reprogramId &&
          appointment.patientId === patient.id &&
          appointment.status === 'confirmed',
      )
    : undefined

  const requestedDoctor = data.doctors.find(
    (doctor) => doctor.id === requestedDoctorId && doctor.active,
  )
  const initialDoctor = rescheduleTarget
    ? data.doctors.find(
        (doctor) => doctor.id === rescheduleTarget.doctorId && doctor.active,
      )
    : requestedDoctor
  const initialDoctorId = initialDoctor?.id ?? ''

  const [specialty, setSpecialty] = useState(
    initialDoctor?.specialty ?? specialtyParam,
  )
  const [doctorId, setDoctorId] = useState(initialDoctorId)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState(rescheduleTarget?.reason ?? '')
  const [step, setStep] = useState<Step>(initialDoctorId ? 2 : 1)
  const [accepted, setAccepted] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<Appointment | null>(null)

  const today = todayISO()
  const activeDoctors = data.doctors.filter((doctor) => doctor.active)
  const specialties = [...new Set(activeDoctors.map((doctor) => doctor.specialty))]
  const filteredDoctors = specialty
    ? activeDoctors.filter((doctor) => doctor.specialty === specialty)
    : activeDoctors
  const doctor = data.doctors.find(
    (item) => item.id === doctorId && item.active,
  )

  const availability = useMemo(() => {
    const map = new Map<string, Slot[]>()
    const selected = data.doctors.find(
      (item) => item.id === doctorId && item.active,
    )
    if (!selected) return map
    for (let offset = 0; offset <= 60; offset += 1) {
      const dateISO = addDaysISO(today, offset)
      const slots = getAvailableSlots({
        schedules: data.schedules,
        appointments: data.appointments,
        doctorId: selected.id,
        dateISO,
        ignoreAppointmentId: rescheduleTarget?.id,
      })
      if (slots.length > 0) map.set(dateISO, slots)
    }
    return map
  }, [data.appointments, data.doctors, data.schedules, doctorId, rescheduleTarget?.id, today])

  const slots = date ? (availability.get(date) ?? []) : []
  const nextDays = [...availability.entries()].slice(0, 4)
  const calendarEvents = [...availability.entries()].map(([dateISO, daySlots]) => ({
    start: dateISO,
    allDay: true,
    title: `${daySlots.length}`,
    className: 'availability-event',
    extendedProps: { count: daySlots.length },
  }))

  if (!patient) return null

  const selectDate = (dateISO: string) => {
    if (!availability.has(dateISO)) {
      toast('No hay cupos disponibles ese día. Prueba otra fecha.', 'info')
      return
    }
    setDate(dateISO)
    setTime('')
    setStep(2)
    setFormError('')
    window.setTimeout(() => {
      document.getElementById('horarios')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 40)
  }

  const handleDoctorSelect = (selected: Doctor) => {
    setDoctorId(selected.id)
    setDate('')
    setTime('')
    setStep(2)
    setFormError('')
    window.setTimeout(() => {
      document.getElementById('agenda')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 80)
  }

  const handleSpecialty = (value: string) => {
    setSpecialty(value)
    setDate('')
    setTime('')
    setFormError('')
    if (doctor && value && doctor.specialty !== value) {
      setDoctorId('')
      setStep(1)
    }
  }

  const handleTimeSelect = (slotStart: string) => {
    setTime(slotStart)
    setStep(3)
    setFormError('')
    window.setTimeout(() => {
      document.getElementById('confirmar')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 40)
  }

  const handleConfirm = () => {
    setFormError('')
    if (!doctor || !date || !time) {
      setFormError('Elige un médico, una fecha y un horario.')
      return
    }
    if (!accepted) {
      setFormError('Confirma que revisaste las condiciones de la cita.')
      return
    }
    const reasonError = validateReason(reason)
    if (reasonError) {
      setFormError(reasonError)
      return
    }

    setSubmitting(true)
    const payload = {
      doctorId: doctor.id,
      date,
      start: time,
      reason,
    }
    const result = rescheduleTarget
      ? rescheduleAppointment(rescheduleTarget.id, payload)
      : bookAppointment(payload)
    setSubmitting(false)

    if (!result.ok || !result.appointment) {
      setFormError(result.error ?? 'No se pudo confirmar la cita.')
      toast(result.error ?? 'No se pudo confirmar la cita.', 'error')
      return
    }

    setSuccess(result.appointment)
    toast(
      rescheduleTarget
        ? 'Cita reprogramada correctamente.'
        : 'Cita confirmada correctamente.',
      'success',
    )
  }

  if (success) {
    const successDoctor = data.doctors.find(
      (item) => item.id === success.doctorId,
    )
    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-xl shadow-brand-900/5">
          <div className="relative overflow-hidden bg-brand-950 px-6 py-10 text-center text-white">
            <div className="dot-grid absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-brand-700">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-300">
                {rescheduleTarget ? 'Cita reprogramada' : 'Cita confirmada'}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
                Nos vemos en la posta.
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Guarda los detalles de tu cita. Llega 10 minutos antes con tu DNI.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-line bg-sand/50 p-4">
              <div className="flex items-center gap-3">
                {successDoctor && (
                  <Avatar
                    firstName={successDoctor.firstName}
                    lastName={successDoctor.lastNamePaternal}
                    color={successDoctor.color}
                    size="md"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">
                    {successDoctor ? doctorFullName(successDoctor) : 'Consulta'}
                  </p>
                  <p className="text-xs text-ink/50">
                    {successDoctor?.specialty ?? 'Atención médica'}
                  </p>
                </div>
                <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-bold text-ink/50">
                  Código {appointmentCode(success.id)}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                    Fecha
                  </dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {formatLongDate(success.date, true)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                    Hora
                  </dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {formatTime12(success.start)} – {formatTime12(success.end)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                    Paciente
                  </dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {patientFullName(patient)} · DNI {patient.dni}
                  </dd>
                </div>
                {success.reason && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                      Motivo
                    </dt>
                    <dd className="mt-1 text-ink/70">{success.reason}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3.5 text-[11px] leading-5 text-brand-900/65">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
              <p>
                Puedes cancelar o reprogramar hasta 24 horas antes desde{' '}
                <strong>Mis citas</strong>. El pago se realiza en recepción.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/mi-cuenta/citas"
                className={buttonStyles({ full: true, size: 'lg' })}
              >
                Ver mis citas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/mi-cuenta"
                className={buttonStyles({ variant: 'outline', full: true, size: 'lg' })}
              >
                Volver al resumen
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, label: 'Médico' },
    { number: 2, label: 'Fecha y hora' },
    { number: 3, label: 'Confirmar' },
  ] as const

  const goToStep = (target: Step) => {
    if (target > 1 && !doctor) return
    if (target > 2 && (!date || !time)) return
    setStep(target)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/mi-cuenta"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/50 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Volver a mi cuenta
      </Link>

      <PageHeader
        eyebrow={rescheduleTarget ? 'Reprogramar cita' : 'Nueva reserva'}
        title={rescheduleTarget ? 'Elige un nuevo horario.' : 'Reserva tu cita.'}
        description="Cada cita dura 30 minutos. Solo verás cupos libres; la agenda se actualiza al confirmar."
      />

      {rescheduleTarget && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-amber-700">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="text-xs leading-5">
            <p className="font-bold">Estás reprogramando una cita existente.</p>
            <p className="mt-0.5 text-amber-800/70">
              Cita actual: {formatLongDate(rescheduleTarget.date)} a las{' '}
              {formatTime12(rescheduleTarget.start)} con{' '}
              {data.doctors.find((item) => item.id === rescheduleTarget.doctorId)
                ? doctorFullName(
                    data.doctors.find(
                      (item) => item.id === rescheduleTarget.doctorId,
                    )!,
                  )
                : 'la posta'}
              . Al confirmar, se moverá a la nueva fecha y hora.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 rounded-2xl border border-line bg-white p-1.5 sm:gap-2">
        {steps.map((item) => {
          const active = step === item.number
          const complete = step > item.number
          return (
            <button
              key={item.number}
              type="button"
              onClick={() => goToStep(item.number)}
              className={clsx(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-[11px] font-bold transition sm:text-xs',
                active
                  ? 'bg-brand-700 text-white'
                  : complete
                    ? 'bg-brand-50 text-brand-800 hover:bg-brand-100'
                    : 'text-ink/35',
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={clsx(
                  'grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold',
                  active
                    ? 'bg-white/20 text-white'
                    : complete
                      ? 'bg-brand-700 text-white'
                      : 'bg-sand text-ink/45',
                )}
              >
                {complete ? '✓' : item.number}
              </span>
              {item.label}
            </button>
          )
        })}
      </div>

      {step === 1 && (
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Elige una especialidad
              </h2>
              <p className="mt-1 text-xs text-ink/45">
                {activeDoctors.length} médicos disponibles en la posta.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[10px] font-bold text-ink/50">
              <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              Reserva hasta 60 días antes
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por especialidad">
            <button
              type="button"
              onClick={() => handleSpecialty('')}
              className={clsx(
                'rounded-full border px-3.5 py-2 text-xs font-bold transition',
                specialty === ''
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-line bg-paper text-ink/55 hover:border-brand-300 hover:text-ink',
              )}
            >
              Todas
            </button>
            {specialties.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSpecialty(item)}
                className={clsx(
                  'rounded-full border px-3.5 py-2 text-xs font-bold transition',
                  specialty === item
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-line bg-paper text-ink/55 hover:border-brand-300 hover:text-ink',
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {filteredDoctors.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {filteredDoctors.map((item) => {
                const status = getDoctorAvailabilityStatus(
                  {
                    schedules: data.schedules,
                    appointments: data.appointments,
                    doctorId: item.id,
                  },
                  item.id,
                )
                const schedule = summarizeSchedules(data.schedules, item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDoctorSelect(item)}
                    className={clsx(
                      'group rounded-2xl border p-4 text-left transition',
                      doctorId === item.id
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/15'
                        : 'border-line bg-paper hover:border-brand-300 hover:bg-brand-50/30',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        firstName={item.firstName}
                        lastName={item.lastNamePaternal}
                        color={item.color}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">
                          {doctorFullName(item)}
                        </p>
                        <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-brand-700">
                          {item.specialty}
                        </p>
                        <Pill
                          tone={
                            status.tone === 'available'
                              ? 'green'
                              : status.tone === 'soon'
                                ? 'amber'
                                : 'neutral'
                          }
                          className="mt-2"
                        >
                          {status.label}
                        </Pill>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 border-t border-line/70 pt-2.5">
                      {schedule.slice(0, 2).map((line) => (
                        <p
                          key={line}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-ink/45"
                        >
                          <Clock className="h-3 w-3 shrink-0 text-brand-500" aria-hidden="true" />
                          {line}
                        </p>
                      ))}
                      {schedule.length === 0 && (
                        <p className="text-[10px] font-semibold text-amber-700">
                          Sin horario asignado por ahora
                        </p>
                      )}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-700">
                      Elegir este médico
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-sand/40 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-ink">
                No hay médicos en esta especialidad.
              </p>
              <button
                type="button"
                onClick={() => handleSpecialty('')}
                className="mt-2 text-xs font-bold text-brand-700 hover:text-brand-900"
              >
                Ver todas las especialidades
              </button>
            </div>
          )}
        </section>
      )}

      {step >= 2 && doctor && (
        <section id="agenda" className="scroll-mt-24">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar
                firstName={doctor.firstName}
                lastName={doctor.lastNamePaternal}
                color={doctor.color}
                size="md"
              />
              <div>
                <p className="text-sm font-bold text-ink">{doctorFullName(doctor)}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">
                  {doctor.specialty}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              Cambiar médico
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Elige el día
                  </h2>
                  <p className="text-xs text-ink/45">
                    Los números indican cupos libres.
                  </p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                  30 min
                </span>
              </div>
              <div className="calendar-shell mt-3">
                <FullCalendar
                  key={doctor.id}
                  plugins={calendarPlugins}
                  initialView="dayGridMonth"
                  initialDate={today}
                  locale={esLocale}
                  height="auto"
                  fixedWeekCount={false}
                  dayMaxEvents={3}
                  showNonCurrentDates={false}
                  validRange={{
                    start: startOfMonthISO(today),
                    end: addDaysISO(
                      endOfMonthISO(addDaysISO(today, 60)),
                      1,
                    ),
                  }}
                  dayCellClass={(info) =>
                    availability.has(isoDate(info.date)) ? '' : 'day-no-slots'
                  }
                  headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'today',
                  }}
                  events={calendarEvents}
                  eventDisplay="block"
                  dateClick={(arg) => selectDate(arg.dateStr)}
                  eventClick={(arg) => selectDate(arg.event.startStr.slice(0, 10))}
                  eventContent={(arg) => (
                    <div className="flex items-center justify-center gap-1.5 px-0.5 py-0.5 text-[10px] font-extrabold text-brand-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                      {arg.event.title}
                    </div>
                  )}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-sand/60 px-3 py-2 text-[10px] font-medium text-ink/45">
                <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />
                Días con cupos disponibles
              </div>
            </div>

            <div
              id="horarios"
              className="scroll-mt-24 rounded-2xl border border-line bg-white p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start"
            >
              <h2 className="font-display text-xl font-semibold text-ink">
                Horarios disponibles
              </h2>
              {date ? (
                <>
                  <p className="mt-1 text-xs text-ink/50">
                    {formatLongDate(date, true)}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => handleTimeSelect(slot.start)}
                        className={clsx(
                          'rounded-xl border px-1 py-2.5 text-[11px] font-bold transition',
                          time === slot.start
                            ? 'border-brand-700 bg-brand-700 text-white'
                            : 'border-line bg-paper text-ink/70 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800',
                        )}
                      >
                        {formatTime12(slot.start)}
                      </button>
                    ))}
                  </div>
                  {slots.length === 0 && (
                    <p className="mt-4 rounded-xl bg-sand px-3 py-4 text-xs text-ink/45">
                      Este día ya no tiene cupos. Elige otra fecha.
                    </p>
                  )}
                  <p className="mt-4 border-t border-line pt-3 text-[10px] leading-4 text-ink/40">
                    Hora local de Lima. Cada cita reserva un bloque de 30 minutos.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-xs text-ink/50">
                    Selecciona un día en el calendario para ver sus horas.
                  </p>
                  {nextDays.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                        Próximos días con cupo
                      </p>
                      <div className="mt-2 space-y-2">
                        {nextDays.map(([dateISO, daySlots]) => (
                          <button
                            key={dateISO}
                            type="button"
                            onClick={() => selectDate(dateISO)}
                            className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
                          >
                            <span className="text-xs font-bold text-ink">
                              {relativeDayLabel(dateISO)}
                            </span>
                            <span className="text-[10px] font-bold text-brand-700">
                              {daySlots.length} cupos
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 3 && doctor && date && time && (
        <section
          id="confirmar"
          className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02] sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Confirma tu cita
              </h2>
              <p className="mt-1 text-xs text-ink/45">
                Revisa los datos antes de reservar el cupo.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-bold text-brand-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Pago en recepción
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sand/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Médico
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{doctorFullName(doctor)}</p>
              <p className="text-xs text-ink/50">{doctor.specialty}</p>
            </div>
            <div className="rounded-2xl bg-sand/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Fecha
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{formatLongDate(date)}</p>
              <p className="text-xs text-ink/50">{relativeDayLabel(date)}</p>
            </div>
            <div className="rounded-2xl bg-sand/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Hora
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{formatTime12(time)}</p>
              <p className="text-xs text-ink/50">Duración: 30 minutos</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-line p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                Paciente
              </p>
              <p className="mt-2 text-sm font-bold text-ink">{patientFullName(patient)}</p>
              <div className="mt-2 space-y-1 text-xs text-ink/55">
                <p>DNI {patient.dni}</p>
                <p>{patient.email}</p>
                <p>{patient.phone}</p>
              </div>
              <Link
                to="/mi-cuenta/perfil"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900"
              >
                Revisar mis datos
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            <TextAreaField
              label="Motivo de la consulta (opcional)"
              rows={4}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                setFormError('')
              }}
              placeholder="Ej. Control de presión, dolor dental, control prenatal…"
              maxLength={200}
              hint={`${reason.length}/200 caracteres`}
            />
          </div>

          <label className="mt-5 flex items-start gap-2.5 rounded-xl border border-line bg-sand/40 p-3.5 text-xs leading-5 text-ink/60">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked)
                setFormError('')
              }}
              className="mt-0.5 h-4 w-4 rounded border-line text-brand-700 accent-brand-700"
            />
            <span>
              Entiendo que puedo cancelar o reprogramar hasta 24 horas antes. Si
              no puedo asistir, avisaré a la posta.
            </span>
          </label>

          {formError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {formError}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
              Volver a elegir hora
            </Button>
            <Button onClick={handleConfirm} loading={submitting} size="lg">
              {rescheduleTarget ? 'Confirmar reprogramación' : 'Confirmar cita'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
