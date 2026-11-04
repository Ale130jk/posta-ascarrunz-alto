import type { Appointment, Doctor, ScheduleBlock } from '../../types'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { getDoctorAvailabilityStatus, summarizeSchedules } from '../../lib/availability'
import { doctorFullName } from '../../lib/names'
import { Avatar } from '../ui/Avatar'
import { Pill } from '../ui/Badge'
import { buttonStyles } from '../ui/Button'

export function DoctorCard({
  doctor,
  schedules,
  appointments,
}: {
  doctor: Doctor
  schedules: ScheduleBlock[]
  appointments: Appointment[]
}) {
  const status = getDoctorAvailabilityStatus(
    { schedules, appointments, doctorId: doctor.id },
    doctor.id,
  )
  const summary = summarizeSchedules(schedules, doctor.id)
  const tone =
    status.tone === 'available' ? 'green' : status.tone === 'soon' ? 'amber' : 'neutral'

  return (
    <article className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-sm shadow-ink/[0.02] transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
      <div className="flex items-start justify-between gap-3">
        <Avatar
          firstName={doctor.firstName}
          lastName={doctor.lastNamePaternal}
          color={doctor.color}
          size="lg"
        />
        <Pill tone={tone}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {status.label}
        </Pill>
      </div>

      <h3 className="mt-4 font-display text-[1.35rem] font-semibold leading-tight tracking-tight text-ink">
        {doctorFullName(doctor)}
      </h3>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
        {doctor.specialty}
      </p>
      {doctor.bio && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/55">{doctor.bio}</p>
      )}

      <div className="mt-4 space-y-1.5 rounded-xl bg-sand/70 px-3 py-2.5">
        {summary.length > 0 ? (
          summary.slice(0, 2).map((line) => (
            <p
              key={line}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-ink/60"
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              {line}
            </p>
          ))
        ) : (
          <p className="text-[11px] font-semibold text-ink/45">
            Horario por confirmar
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/35">
          {doctor.license || 'Colegiatura pendiente'}
        </span>
        <Link
          to={`/mi-cuenta/reservar?doctor=${doctor.id}`}
          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        >
          Reservar
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
