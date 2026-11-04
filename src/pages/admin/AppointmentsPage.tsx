import { useMemo, useState } from 'react'
import {
  CalendarCheck2,
  CalendarDays,
  CalendarX2,
  Check,
  ClipboardList,
  Eye,
  Search,
  XCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader, StatCard, EmptyState } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { SelectField, TextField } from '../../components/ui/Fields'
import {
  appointmentDateTime,
  formatLongDate,
  formatTime12,
  sortAppointments,
  todayISO,
} from '../../lib/dates'
import { appointmentCode, doctorFullName, patientFullName } from '../../lib/names'
import type { Appointment, AppointmentStatus } from '../../types'

type StatusFilter = 'all' | AppointmentStatus

export function AppointmentsPage() {
  const { data, completeAppointment, cancelAppointment } = useClinic()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [detail, setDetail] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  const today = todayISO()

  const doctorById = (id: string) =>
    data.doctors.find((doctor) => doctor.id === id)
  const patientById = (id: string) =>
    data.patients.find((patient) => patient.id === id)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.appointments
      .filter((appointment) => {
        if (status !== 'all' && appointment.status !== status) return false
        if (doctorId && appointment.doctorId !== doctorId) return false
        if (date && appointment.date !== date) return false
        if (!needle) return true
        const doctor = doctorById(appointment.doctorId)
        const patient = patientById(appointment.patientId)
        return [
          patient ? patientFullName(patient) : '',
          patient?.email ?? '',
          patient?.dni ?? '',
          patient?.phone ?? '',
          doctor ? doctorFullName(doctor) : '',
          doctor?.specialty ?? '',
          appointment.reason,
          appointmentCode(appointment.id),
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
      .sort((a, b) => sortAppointments(b, a))
  }, [data.appointments, data.doctors, data.patients, date, doctorId, query, status])

  const todayAppointments = data.appointments.filter(
    (appointment) =>
      appointment.date === today && appointment.status !== 'cancelled',
  )
  const upcomingCount = data.appointments.filter(
    (appointment) =>
      appointment.status === 'confirmed' &&
      appointmentDateTime(appointment.date, appointment.start).getTime() >
        Date.now(),
  ).length
  const completedCount = data.appointments.filter(
    (appointment) => appointment.status === 'completed',
  ).length

  const confirmCancel = () => {
    if (!cancelTarget) return
    const result = cancelAppointment(cancelTarget.id, true)
    setCancelTarget(null)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo cancelar la cita.', 'error')
      return
    }
    toast('Cita cancelada por administración. El cupo quedó libre.', 'success')
    setDetail(null)
  }

  const handleComplete = (appointment: Appointment) => {
    const result = completeAppointment(appointment.id)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo marcar la cita.', 'error')
      return
    }
    toast('Cita marcada como atendida.', 'success')
    setDetail(null)
  }

  const detailDoctor = detail ? doctorById(detail.doctorId) : undefined
  const detailPatient = detail ? patientById(detail.patientId) : undefined

  const activeFilters = Boolean(query || doctorId || date || status !== 'all')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Citas"
        title="Todas las reservas, claras."
        description="Busca, revisa y cierra las citas de la posta. La cancelación administrativa libera el cupo."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Citas de hoy"
          value={todayAppointments.length}
          hint={`${todayAppointments.filter((item) => item.status === 'confirmed').length} confirmadas`}
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Próximas"
          value={upcomingCount}
          hint="Confirmadas por venir"
          icon={<CalendarCheck2 className="h-4 w-4" aria-hidden="true" />}
          tone="emerald"
        />
        <StatCard
          label="Atendidas"
          value={completedCount}
          hint="Historial de la posta"
          icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
          tone="sky"
        />
      </div>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative">
            <TextField
              label="Buscar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Paciente, DNI, doctor o código"
              className="pl-9"
            />
            <Search
              className="pointer-events-none absolute left-3 top-[2.4rem] h-4 w-4 text-ink/35"
              aria-hidden="true"
            />
          </div>
          <SelectField
            label="Estado"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
          >
            <option value="all">Todas</option>
            <option value="confirmed">Confirmadas</option>
            <option value="completed">Atendidas</option>
            <option value="cancelled">Canceladas</option>
          </SelectField>
          <SelectField
            label="Doctor"
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
          >
            <option value="">Todos</option>
            {data.doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctorFullName(doctor)}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Fecha"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-ink/45">
            {filtered.length} de {data.appointments.length} citas
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDate(today)}
              className={clsx(
                'text-xs font-bold transition',
                date === today
                  ? 'text-brand-800'
                  : 'text-ink/50 hover:text-brand-700',
              )}
            >
              Ver hoy
            </button>
            {activeFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setStatus('all')
                  setDoctorId('')
                  setDate('')
                }}
                className="text-xs font-bold text-brand-700 hover:text-brand-900"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="h-5 w-5" aria-hidden="true" />}
          title="No hay citas con esos filtros"
          description="Cambia la fecha, el doctor o el estado para ver otras reservas."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-ink/[0.02] lg:block">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-sand/50">
                <tr className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/40">
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Fecha y hora</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filtered.map((appointment) => {
                  const patient = patientById(appointment.patientId)
                  const doctor = doctorById(appointment.doctorId)
                  return (
                    <tr
                      key={appointment.id}
                      className="text-sm transition hover:bg-sand/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            firstName={patient?.firstName ?? 'P'}
                            lastName={patient?.lastNamePaternal}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-ink">
                              {patient ? patientFullName(patient) : 'Paciente'}
                            </p>
                            <p className="truncate text-[10px] text-ink/40">
                              DNI {patient?.dni || '—'} · {patient?.phone || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-ink/75">
                          {doctor ? doctorFullName(doctor) : 'Médico'}
                        </p>
                        <p className="text-[10px] text-ink/40">
                          {doctor?.specialty ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-ink/75">
                          {formatLongDate(appointment.date)}
                        </p>
                        <p className="text-[10px] text-ink/40">
                          {formatTime12(appointment.start)} –{' '}
                          {formatTime12(appointment.end)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetail(appointment)}
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Ver
                          </Button>
                          {appointment.status === 'confirmed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleComplete(appointment)}
                                className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                Atender
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCancelTarget(appointment)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                Cancelar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filtered.map((appointment) => {
              const patient = patientById(appointment.patientId)
              const doctor = doctorById(appointment.doctorId)
              return (
                <article
                  key={appointment.id}
                  className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        firstName={patient?.firstName ?? 'P'}
                        lastName={patient?.lastNamePaternal}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">
                          {patient ? patientFullName(patient) : 'Paciente'}
                        </p>
                        <p className="truncate text-[10px] text-ink/40">
                          DNI {patient?.dni || '—'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/70 pt-3 text-[11px]">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                        Doctor
                      </p>
                      <p className="mt-0.5 font-semibold text-ink/75">
                        {doctor ? doctorFullName(doctor) : 'Médico'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                        Fecha y hora
                      </p>
                      <p className="mt-0.5 font-semibold text-ink/75">
                        {formatLongDate(appointment.date)}
                      </p>
                      <p className="text-ink/45">
                        {formatTime12(appointment.start)} –{' '}
                        {formatTime12(appointment.end)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetail(appointment)}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Detalles
                    </Button>
                    {appointment.status === 'confirmed' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComplete(appointment)}
                          className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Atender
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelTarget(appointment)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title="Detalle de la cita"
        description={
          detail ? `Código ${appointmentCode(detail.id)}` : undefined
        }
        size="md"
        footer={
          detail?.status === 'confirmed' ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setCancelTarget(detail)
                  setDetail(null)
                }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Cancelar cita
              </Button>
              <Button onClick={() => handleComplete(detail)}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Marcar atendida
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setDetail(null)}>
              Cerrar
            </Button>
          )
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={detailPatient?.firstName ?? 'P'}
                  lastName={detailPatient?.lastNamePaternal}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold text-ink">
                    {detailPatient
                      ? patientFullName(detailPatient)
                      : 'Paciente no encontrado'}
                  </p>
                  <p className="truncate text-xs text-ink/45">
                    {detailPatient?.email ?? '—'}
                  </p>
                </div>
              </div>
              <StatusBadge status={detail.status} />
            </div>

            <dl className="grid gap-3 rounded-xl bg-sand/60 p-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                  Fecha
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  {formatLongDate(detail.date, true)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                  Horario
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  {formatTime12(detail.start)} – {formatTime12(detail.end)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                  Doctor
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  {detailDoctor ? doctorFullName(detailDoctor) : '—'}
                </dd>
                <dd className="text-ink/45">{detailDoctor?.specialty ?? ''}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                  Paciente
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  DNI {detailPatient?.dni || '—'}
                </dd>
                <dd className="text-ink/45">{detailPatient?.phone || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink/35">
                  Motivo
                </dt>
                <dd className="mt-1 leading-5 text-ink/70">
                  {detail.reason || 'Sin motivo registrado.'}
                </dd>
              </div>
            </dl>

            <div className="flex items-start gap-2 rounded-xl border border-line bg-white p-3 text-[11px] leading-5 text-ink/50">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              Reservada el {formatLongDate(detail.createdAt.slice(0, 10), true)}.
              Última actualización:{' '}
              {formatLongDate(detail.updatedAt.slice(0, 10), true)}.
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        title="Cancelar cita"
        description={
          cancelTarget ? (
            <>
              Se cancelará la cita de{' '}
              <strong>
                {patientById(cancelTarget.patientId)
                  ? patientFullName(patientById(cancelTarget.patientId)!)
                  : 'el paciente'}
              </strong>{' '}
              del {formatLongDate(cancelTarget.date)} a las{' '}
              {formatTime12(cancelTarget.start)}. El cupo volverá a estar disponible.
            </>
          ) : null
        }
        confirmLabel="Sí, cancelar cita"
        cancelLabel="Volver"
      />
    </div>
  )
}
