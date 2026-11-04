import { Link } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Clock,
  MessagesSquare,
  Plus,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useClinic } from '../../context/ClinicContext'
import { PageHeader, StatCard, EmptyState } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { buttonStyles } from '../../components/ui/Button'
import {
  appointmentDateTime,
  formatLongDate,
  formatTime12,
  sortAppointments,
  todayISO,
} from '../../lib/dates'
import { doctorFullName, patientFullName } from '../../lib/names'
import { calendarPlugins, esLocale } from '../../lib/calendar'

export function AdminDashboardPage() {
  const { data } = useClinic()
  const today = todayISO()

  const todayAppointments = data.appointments
    .filter(
      (appointment) =>
        appointment.date === today && appointment.status !== 'cancelled',
    )
    .sort(sortAppointments)

  const todayConfirmed = todayAppointments.filter(
    (appointment) => appointment.status === 'confirmed',
  )

  const upcoming = data.appointments
    .filter(
      (appointment) =>
        appointment.status === 'confirmed' &&
        appointmentDateTime(appointment.date, appointment.start).getTime() >
          Date.now(),
    )
    .sort(sortAppointments)
    .slice(0, 5)

  const unread = data.messages.filter((message) => !message.read).length
  const activeDoctors = data.doctors.filter((doctor) => doctor.active).length

  const doctorById = (id: string) => data.doctors.find((doctor) => doctor.id === id)
  const patientById = (id: string) => data.patients.find((patient) => patient.id === id)

  const events = todayAppointments.map((appointment) => {
    const doctor = doctorById(appointment.doctorId)
    const patient = patientById(appointment.patientId)
    return {
      id: appointment.id,
      title: `${patient?.firstName ?? 'Paciente'} · ${doctor?.lastNamePaternal ?? 'Médico'}`,
      start: `${appointment.date}T${appointment.start}:00`,
      end: `${appointment.date}T${appointment.end}:00`,
      backgroundColor:
        appointment.status === 'completed' ? '#0ea5e9' : '#1d5e55',
      borderColor: 'transparent',
      textColor: '#ffffff',
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel de la posta"
        title="El día de hoy, en orden."
        description={`${formatLongDate(today, true)} · Revisa la agenda, las citas y los mensajes de Ascarrunz Alto.`}
        actions={
          <>
            <Link
              to="/admin/doctores?nuevo=1"
              className={buttonStyles({ variant: 'outline', size: 'md' })}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Registrar doctor
            </Link>
            <Link to="/admin/horarios" className={buttonStyles({ size: 'md' })}>
              <CalendarRange className="h-4 w-4" aria-hidden="true" />
              Asignar horario
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Citas de hoy"
          value={todayConfirmed.length}
          hint={`${todayAppointments.length} en la agenda de hoy`}
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Pacientes"
          value={data.patients.length}
          hint="Registrados en la posta"
          icon={<UserRound className="h-4 w-4" aria-hidden="true" />}
          tone="sky"
        />
        <StatCard
          label="Doctores activos"
          value={activeDoctors}
          hint={`${data.doctors.length} registrados en total`}
          icon={<UsersRound className="h-4 w-4" aria-hidden="true" />}
          tone="emerald"
        />
        <StatCard
          label="Mensajes sin leer"
          value={unread}
          hint={`${data.messages.length} mensajes recibidos`}
          icon={<MessagesSquare className="h-4 w-4" aria-hidden="true" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Agenda de hoy
              </h2>
              <p className="text-xs text-ink/45">
                Citas confirmadas y atendidas de la fecha.
              </p>
            </div>
            <Link
              to="/admin/citas"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900"
            >
              Ver todas las citas
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="calendar-shell mt-4">
            <FullCalendar
              plugins={calendarPlugins}
              initialView="timeGridDay"
              initialDate={today}
              locale={esLocale}
              height={520}
              allDaySlot={false}
              nowIndicator
              slotMinTime="08:00:00"
              slotMaxTime="19:00:00"
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'today',
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }}
              events={events}
              eventDisplay="block"
              noEventsContent="No hay citas para hoy."
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  Próximas citas
                </h2>
                <p className="text-xs text-ink/45">Siguientes en la agenda.</p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length > 0 ? (
              <div className="mt-4 space-y-3">
                {upcoming.map((appointment) => {
                  const patient = patientById(appointment.patientId)
                  const doctor = doctorById(appointment.doctorId)
                  return (
                    <div
                      key={appointment.id}
                      className="rounded-xl border border-line/70 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar
                            firstName={patient?.firstName ?? 'P'}
                            lastName={patient?.lastNamePaternal}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-ink">
                              {patient ? patientFullName(patient) : 'Paciente'}
                            </p>
                            <p className="truncate text-[10px] text-ink/45">
                              {doctor ? doctorFullName(doctor) : 'Médico'}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink/50">
                        <Clock className="h-3 w-3 text-brand-600" aria-hidden="true" />
                        {formatTime12(appointment.start)} ·{' '}
                        {appointment.date === today
                          ? 'Hoy'
                          : formatLongDate(appointment.date)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
                title="Sin citas próximas"
                description="Cuando los pacientes reserven, aparecerán aquí."
                className="mt-4 border-0 bg-sand/40 py-8"
              />
            )}

            <Link
              to="/admin/citas"
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-bold text-ink/60 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              Gestionar citas
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02]">
            <h2 className="font-display text-xl font-semibold text-ink">
              Acciones rápidas
            </h2>
            <div className="mt-3 grid gap-2">
              {[
                {
                  to: '/admin/doctores?nuevo=1',
                  label: 'Registrar un doctor',
                  icon: Plus,
                },
                {
                  to: '/admin/horarios',
                  label: 'Asignar horarios',
                  icon: CalendarRange,
                },
                {
                  to: '/admin/mensajes',
                  label: 'Revisar mensajes',
                  icon: MessagesSquare,
                },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-2.5 rounded-xl border border-line/70 px-3 py-2.5 text-xs font-semibold text-ink/65 transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800"
                  >
                    <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {action.label}
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink/25" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
            Horario de atención
          </p>
          <p className="mt-1.5 text-sm font-bold text-ink">Lun – Sáb · 9:00 a 18:00</p>
          <p className="mt-0.5 text-xs text-ink/45">Citas de 30 minutos</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
            Sede
          </p>
          <p className="mt-1.5 text-sm font-bold text-ink">Ascarrunz Alto</p>
          <p className="mt-0.5 text-xs text-ink/45">San Juan de Lurigancho, Lima</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
            Mensajes
          </p>
          <p className="mt-1.5 text-sm font-bold text-ink">
            {unread > 0 ? `${unread} sin leer` : 'Todo revisado'}
          </p>
          <Link
            to="/admin/mensajes"
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
          >
            Abrir bandeja
            <ClipboardList className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
