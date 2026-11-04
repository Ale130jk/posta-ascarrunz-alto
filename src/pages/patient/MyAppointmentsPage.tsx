import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CalendarPlus,
  History,
  Info,
  XCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader, EmptyState } from '../../components/ui/Page'
import { AppointmentCard } from '../../components/clinic/AppointmentCard'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { buttonStyles } from '../../components/ui/Button'
import { appointmentDateTime, formatLongDate, formatTime12, sortAppointments } from '../../lib/dates'

type Tab = 'upcoming' | 'history' | 'cancelled'

export function MyAppointmentsPage() {
  const { data, patient, cancelAppointment } = useClinic()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [cancelId, setCancelId] = useState<string | null>(null)

  if (!patient) return null

  const appointments = data.appointments.filter(
    (appointment) => appointment.patientId === patient.id,
  )

  const upcoming = appointments
    .filter(
      (appointment) =>
        appointment.status === 'confirmed' &&
        appointmentDateTime(appointment.date, appointment.start).getTime() >
          Date.now(),
    )
    .sort(sortAppointments)
  const history = appointments
    .filter(
      (appointment) =>
        appointment.status === 'completed' ||
        (appointment.status === 'confirmed' &&
          appointmentDateTime(appointment.date, appointment.start).getTime() <=
            Date.now()),
    )
    .sort((a, b) => sortAppointments(b, a))
  const cancelled = appointments
    .filter((appointment) => appointment.status === 'cancelled')
    .sort((a, b) => sortAppointments(b, a))

  const tabs: { id: Tab; label: string; count: number; icon: typeof CalendarDays }[] = [
    { id: 'upcoming', label: 'Próximas', count: upcoming.length, icon: CalendarDays },
    { id: 'history', label: 'Historial', count: history.length, icon: History },
    { id: 'cancelled', label: 'Canceladas', count: cancelled.length, icon: XCircle },
  ]

  const visible = tab === 'upcoming' ? upcoming : tab === 'history' ? history : cancelled
  const cancelTarget = appointments.find((appointment) => appointment.id === cancelId)

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

  const emptyCopy =
    tab === 'upcoming'
      ? {
          title: 'No tienes citas próximas',
          description:
            'Elige una especialidad y revisa los horarios disponibles de la posta.',
        }
      : tab === 'history'
        ? {
            title: 'Todavía no hay atenciones',
            description:
              'Las citas atendidas o pasadas aparecerán en tu historial.',
          }
        : {
            title: 'No tienes citas canceladas',
            description: 'Las citas que canceles aparecerán aquí.',
          }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mis citas"
        title="Tu agenda, en un solo lugar."
        description="Consulta tus próximas citas, reprograma o revisa tu historial de atención."
        actions={
          <Link to="/mi-cuenta/reservar" className={buttonStyles({ size: 'md' })}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Reservar cita
          </Link>
        }
      />

      <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs leading-5 text-brand-900/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
        <p>
          Puedes cancelar o reprogramar hasta <strong>24 horas antes</strong> de la
          cita. Después de ese plazo, comunícate directamente con la posta.
        </p>
      </div>

      <div
        className="flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 no-scrollbar"
        role="tablist"
        aria-label="Filtro de citas"
      >
        {tabs.map((item) => {
          const Icon = item.icon
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={clsx(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition',
                active
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink/50 hover:bg-sand hover:text-ink',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
              <span
                className={clsx(
                  'grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-extrabold',
                  active ? 'bg-white/15 text-white' : 'bg-sand text-ink/50',
                )}
              >
                {item.count}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              doctor={data.doctors.find(
                (doctor) => doctor.id === appointment.doctorId,
              )}
              onCancel={
                tab === 'upcoming' ? () => setCancelId(appointment.id) : undefined
              }
              onReschedule={
                tab === 'upcoming'
                  ? () =>
                      navigate(
                        `/mi-cuenta/reservar?reprogramar=${appointment.id}`,
                      )
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            tab === 'cancelled' ? (
              <XCircle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            )
          }
          title={emptyCopy.title}
          description={emptyCopy.description}
          action={
            tab === 'upcoming' ? (
              <Link to="/mi-cuenta/reservar" className={buttonStyles({ size: 'md' })}>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Reservar cita
              </Link>
            ) : undefined
          }
        />
      )}

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
            ? El horario volverá a quedar disponible.
          </>
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Mantener cita"
      />
    </div>
  )
}
