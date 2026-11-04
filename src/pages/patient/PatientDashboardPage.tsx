import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  UserRound,
  XCircle,
} from 'lucide-react'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader, StatCard, EmptyState } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { buttonStyles } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import {
  appointmentDateTime,
  formatDayMonth,
  formatLongDate,
  formatTime12,
  sortAppointments,
  todayISO,
} from '../../lib/dates'
import { doctorFullName, patientFullName } from '../../lib/names'
import { calendarPlugins, esLocale } from '../../lib/calendar'

export function PatientDashboardPage() {
  const { data, patient, cancelAppointment } = useClinic()
  const toast = useToast()
  const navigate = useNavigate()
  const [cancelId, setCancelId] = useState<string | null>(null)

  if (!patient) return null

  const appointments = data.appointments
    .filter((appointment) => appointment.patientId === patient.id)
    .sort(sortAppointments)

  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status === 'confirmed' &&
      appointmentDateTime(appointment.date, appointment.start).getTime() >
        Date.now(),
  )
  const nextAppointment = upcoming[0]
  const completed = appointments.filter(
    (appointment) => appointment.status === 'completed',
  )
  const cancelled = appointments.filter(
    (appointment) => appointment.status === 'cancelled',
  )

  const doctorById = (doctorId: string) =>
    data.doctors.find((doctor) => doctor.id === doctorId)

  const events = appointments.map((appointment) => {
    const doctor = doctorById(appointment.doctorId)
    const label = doctor
      ? `${formatTime12(appointment.start)} · ${doctor.prefix} ${doctor.lastNamePaternal}`
      : formatTime12(appointment.start)
    return {
      id: appointment.id,
      title: label,
      start: `${appointment.date}T${appointment.start}:00`,
      end: `${appointment.date}T${appointment.end}:00`,
      backgroundColor:
        appointment.status === 'cancelled'
          ? '#d4d0c7'
          : appointment.status === 'completed'
            ? '#0ea5e9'
            : '#217568',
      borderColor: 'transparent',
      textColor: appointment.status === 'cancelled' ? '#5f5a51' : '#ffffff',
      extendedProps: { status: appointment.status },
    }
  })

  const cancelTarget = data.appointments.find(
    (appointment) => appointment.id === cancelId,
  )

  const handleConfirmCancel = () => {
    if (!cancelId) return
    const result = cancelAppointment(cancelId)
    setCancelId(null)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo cancelar la cita.', 'error')
      return
    }
    toast('Cita cancelada. El horario quedó libre.', 'success')
  }

  const nextDoctor = nextAppointment
    ? doctorById(nextAppointment.doctorId)
    : undefined

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mi cuenta"
        title={`Hola, ${patient.firstName.split(' ')[0]}.`}
        description={`${formatLongDate(todayISO(), true)} · Revisa tu agenda y tus próximas citas.`}
        actions={
          <Link to="/mi-cuenta/reservar" className={buttonStyles({ size: 'md' })}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Reservar cita
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Próximas citas"
          value={upcoming.length}
          hint={upcoming.length === 1 ? 'Tienes 1 cita agendada' : 'Citas confirmadas por venir'}
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Atendidas"
          value={completed.length}
          hint="Historial de la posta"
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          tone="emerald"
        />
        <StatCard
          label="Canceladas"
          value={cancelled.length}
          hint="Puedes volver a reservar"
          icon={<XCircle className="h-4 w-4" aria-hidden="true" />}
          tone="rose"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          {nextAppointment && nextDoctor ? (
            <section className="relative overflow-hidden rounded-[1.75rem] bg-brand-950 p-5 text-white shadow-xl shadow-brand-950/10 sm:p-6">
              <div className="dot-grid absolute inset-0 opacity-20" aria-hidden="true" />
              <div
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-700/50 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-300">
                      Tu próxima cita
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                      {formatLongDate(nextAppointment.date)}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-brand-100">
                    {formatTime12(nextAppointment.start)} –{' '}
                    {formatTime12(nextAppointment.end)}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar
                    firstName={nextDoctor.firstName}
                    lastName={nextDoctor.lastNamePaternal}
                    color={nextDoctor.color}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-semibold">
                      {doctorFullName(nextDoctor)}
                    </p>
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.1em] text-brand-300">
                      {nextDoctor.specialty}
                    </p>
                    {nextAppointment.reason && (
                      <p className="mt-1 line-clamp-1 text-xs text-white/50">
                        Motivo: {nextAppointment.reason}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-white/50">
                  <MapPin className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                  Posta Médica Ascarrunz Alto · San Juan de Lurigancho
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to={`/mi-cuenta/reservar?reprogramar=${nextAppointment.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reprogramar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCancelId(nextAppointment.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Cancelar
                  </button>
                  <span className="inline-flex items-center gap-1.5 px-2 py-2 text-[10px] text-white/40">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Llega 10 minutos antes con tu DNI
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <EmptyState
              icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
              title="No tienes citas próximas"
              description="Elige una especialidad, revisa los cupos reales y reserva en pocos pasos."
              action={
                <Link to="/mi-cuenta/reservar" className={buttonStyles({ size: 'md' })}>
                  Reservar mi primera cita
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />
          )}

          <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Mi calendario</h2>
                <p className="text-xs text-ink/45">
                  Tus citas confirmadas, atendidas y canceladas.
                </p>
              </div>
              <Link
                to="/mi-cuenta/citas"
                className="text-xs font-bold text-brand-700 hover:text-brand-900"
              >
                Ver todas
              </Link>
            </div>
            <div className="calendar-shell mt-4">
              <FullCalendar
                plugins={calendarPlugins}
                initialView="dayGridMonth"
                initialDate={todayISO()}
                locale={esLocale}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={2}
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today',
                }}
                events={events}
                eventDisplay="block"
                eventClick={() => navigate('/mi-cuenta/citas')}
              />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">
                Próximas citas
              </h2>
              <Link
                to="/mi-cuenta/citas"
                className="text-xs font-bold text-brand-700 hover:text-brand-900"
              >
                Historial
              </Link>
            </div>
            {upcoming.length > 0 ? (
              <div className="mt-4 space-y-3">
                {upcoming.slice(0, 3).map((appointment) => {
                  const doctor = doctorById(appointment.doctorId)
                  const date = formatDayMonth(appointment.date)
                  return (
                    <Link
                      key={appointment.id}
                      to="/mi-cuenta/citas"
                      className="flex items-center gap-3 rounded-xl border border-line/70 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <span className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-sand text-ink">
                        <span className="font-display text-lg font-semibold leading-none">
                          {date.day}
                        </span>
                        <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink/45">
                          {date.month}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink">
                          {doctor ? doctorFullName(doctor) : 'Consulta'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink/45">
                          {formatTime12(appointment.start)} · {doctor?.specialty}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-sand/60 px-3 py-4 text-xs leading-5 text-ink/45">
                Cuando reserves, tus próximas citas aparecerán aquí.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02]">
            <div className="flex items-start gap-3">
              <Avatar
                firstName={patient.firstName}
                lastName={patient.lastNamePaternal}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">
                  {patientFullName(patient)}
                </p>
                <p className="truncate text-xs text-ink/45">{patient.email}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-ink/45">DNI</dt>
                <dd className="font-semibold text-ink">{patient.dni}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/45">Celular</dt>
                <dd className="font-semibold text-ink">{patient.phone}</dd>
              </div>
            </dl>
            <Link
              to="/mi-cuenta/perfil"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-bold text-ink/70 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Actualizar mis datos
            </Link>
          </section>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold text-brand-900">¿Necesitas ayuda?</p>
            <p className="mt-1 text-[11px] leading-5 text-brand-800/65">
              Llama a la posta o acércate en horario de atención. También puedes
              dejar tu consulta desde la página principal.
            </p>
            <Link
              to="/#contacto"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900"
            >
              Ir a contacto
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar cita"
        description={
          <>
            ¿Seguro que quieres cancelar la cita de{' '}
            <strong>
              {cancelTarget ? formatLongDate(cancelTarget.date) : ''} a las{' '}
              {cancelTarget ? formatTime12(cancelTarget.start) : ''}
            </strong>
            ? El horario volverá a estar disponible para otros pacientes.
          </>
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Mantener cita"
      />
    </div>
  )
}
