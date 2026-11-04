import type { Appointment, Doctor } from '../../types'
import { CalendarClock, Clock, MapPin, RefreshCw, XCircle } from 'lucide-react'
import clsx from 'clsx'
import {
  formatDayMonth,
  formatLongDate,
  formatTime12,
  isPastDateTime,
  canPatientCancel,
} from '../../lib/dates'
import { doctorFullName } from '../../lib/names'
import { StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function AppointmentCard({
  appointment,
  doctor,
  compact = false,
  onCancel,
  onReschedule,
}: {
  appointment: Appointment
  doctor?: Doctor
  compact?: boolean
  onCancel?: () => void
  onReschedule?: () => void
}) {
  const date = formatDayMonth(appointment.date)
  const isPast = isPastDateTime(appointment.date, appointment.start)
  const cancellable =
    appointment.status === 'confirmed' &&
    !isPast &&
    canPatientCancel(appointment.date, appointment.start)
  const showActions =
    appointment.status === 'confirmed' && !isPast && (onCancel || onReschedule)

  return (
    <article
      className={clsx(
        'flex gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:gap-5 sm:p-5',
        appointment.status === 'cancelled' && 'opacity-70',
      )}
    >
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-800">
        <span className="font-display text-2xl font-semibold leading-none">
          {date.day}
        </span>
        <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em]">
          {date.month}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
              {doctor?.specialty ?? 'Consulta'}
            </p>
            <h3 className="mt-0.5 truncate font-display text-lg font-semibold text-ink">
              {doctor ? doctorFullName(doctor) : 'Médico no disponible'}
            </h3>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink/55">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            {formatTime12(appointment.start)} – {formatTime12(appointment.end)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            {formatLongDate(appointment.date)}
          </span>
        </div>

        {!compact && appointment.reason && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/45">
            Motivo: {appointment.reason}
          </p>
        )}

        {!compact && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-ink/40">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Posta Médica Ascarrunz Alto · SJL
          </p>
        )}

        {showActions && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
            {onReschedule && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReschedule}
                disabled={!cancellable}
                title={
                  cancellable
                    ? 'Elegir un nuevo horario'
                    : 'La reprogramación en línea cierra 24 horas antes.'
                }
                className="disabled:text-ink/30"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Reprogramar
              </Button>
            )}
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={!cancellable}
                title={
                  cancellable
                    ? 'Cancelar cita'
                    : 'La cancelación en línea cierra 24 horas antes.'
                }
                className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-ink/30"
              >
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Cancelar
              </Button>
            )}
            {!cancellable && (
              <span className="text-[10px] font-medium text-ink/40">
                Cambios en línea cerrados (menos de 24 h)
              </span>
            )}
          </div>
        )}

        {appointment.status === 'confirmed' && isPast && !compact && (
          <p className="mt-2 text-[11px] font-medium text-ink/40">
            Cita pasada · la posta confirmará tu atención.
          </p>
        )}
      </div>
    </article>
  )
}
