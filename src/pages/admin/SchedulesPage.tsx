import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import {
  CalendarClock,
  CalendarRange,
  Clock,
  Plus,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader, StatCard, EmptyState } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { SelectField } from '../../components/ui/Fields'
import {
  APPOINTMENT_MINUTES,
  CLINIC_CLOSE_TIME,
  CLINIC_OPEN_TIME,
  WEEKDAYS,
} from '../../lib/constants'
import {
  addDaysISO,
  formatTime12,
  isoDate,
  minutesToTime,
  parseLocalDate,
  timeToMinutes,
  todayISO,
  weekdayOf,
} from '../../lib/dates'
import { doctorFullName, patientFullName } from '../../lib/names'
import { calendarPlugins, esLocale } from '../../lib/calendar'
import { summarizeSchedules } from '../../lib/availability'
import type { ScheduleBlock, Weekday } from '../../types'

const TIME_OPTIONS = (() => {
  const options: string[] = []
  const start = timeToMinutes(CLINIC_OPEN_TIME)
  const end = timeToMinutes(CLINIC_CLOSE_TIME)
  for (let cursor = start; cursor <= end; cursor += APPOINTMENT_MINUTES) {
    options.push(minutesToTime(cursor))
  }
  return options
})()

function weekRange(iso: string): { start: string; end: string } {
  const date = parseLocalDate(iso)
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)
  const start = isoDate(monday)
  return { start, end: addDaysISO(start, 7) }
}

function datesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  let cursor = start
  let guard = 0
  while (cursor < end && guard < 60) {
    dates.push(cursor)
    cursor = addDaysISO(cursor, 1)
    guard += 1
  }
  return dates
}

export function SchedulesPage() {
  const { data, addSchedules, deleteSchedule } = useClinic()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const doctors = data.doctors.filter((doctor) => doctor.active)
  const requestedDoctorId = searchParams.get('doctor') ?? ''
  const selectedDoctor =
    doctors.find((doctor) => doctor.id === requestedDoctorId) ?? doctors[0]

  const [range, setRange] = useState(() => weekRange(todayISO()))
  const [formOpen, setFormOpen] = useState(false)
  const [weekdays, setWeekdays] = useState<Weekday[]>([1, 3, 5])
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('13:00')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [blockToDelete, setBlockToDelete] = useState<ScheduleBlock | null>(null)

  useEffect(() => {
    if (selectedDoctor && !requestedDoctorId) {
      setSearchParams({ doctor: selectedDoctor.id }, { replace: true })
    }
  }, [requestedDoctorId, selectedDoctor, setSearchParams])

  const doctorBlocks = useMemo(
    () =>
      selectedDoctor
        ? data.schedules
            .filter((block) => block.doctorId === selectedDoctor.id)
            .sort(
              (a, b) =>
                a.weekday - b.weekday ||
                timeToMinutes(a.start) - timeToMinutes(b.start),
            )
        : [],
    [data.schedules, selectedDoctor],
  )

  const events = useMemo(() => {
    if (!selectedDoctor) return []
    const dates = datesBetween(range.start, range.end)
    const items: {
      id: string
      title: string
      start: string
      end: string
      className: string
      extendedProps: Record<string, unknown>
    }[] = []

    for (const date of dates) {
      const weekday = weekdayOf(date) as Weekday
      for (const block of doctorBlocks) {
        if (block.weekday !== weekday) continue
        items.push({
          id: `block-${block.id}-${date}`,
          title: `Horario ${formatTime12(block.start)} – ${formatTime12(block.end)}`,
          start: `${date}T${block.start}:00`,
          end: `${date}T${block.end}:00`,
          className: 'schedule-block',
          extendedProps: { blockId: block.id },
        })
      }
    }

    for (const appointment of data.appointments) {
      if (appointment.doctorId !== selectedDoctor.id) continue
      if (appointment.date < range.start || appointment.date >= range.end) continue
      if (appointment.status === 'cancelled') continue
      const patient = data.patients.find(
        (item) => item.id === appointment.patientId,
      )
      items.push({
        id: appointment.id,
        title: `${appointment.start} · ${patient ? patientFullName(patient) : 'Paciente'}`,
        start: `${appointment.date}T${appointment.start}:00`,
        end: `${appointment.date}T${appointment.end}:00`,
        className:
          appointment.status === 'completed'
            ? 'appointment-event appointment-event--done'
            : 'appointment-event',
        extendedProps: {
          patient: patient ? patientFullName(patient) : 'Paciente',
          reason: appointment.reason,
          status: appointment.status,
        },
      })
    }

    return items
  }, [data.appointments, data.patients, doctorBlocks, range, selectedDoctor])

  const totalWeeklyHours = doctorBlocks.reduce(
    (total, block) => total + (timeToMinutes(block.end) - timeToMinutes(block.start)),
    0,
  ) / 60

  const futureAppointments = selectedDoctor
    ? data.appointments.filter(
        (appointment) =>
          appointment.doctorId === selectedDoctor.id &&
          appointment.status === 'confirmed' &&
          appointment.date >= todayISO(),
      ).length
    : 0

  const handleAdd = () => {
    if (!selectedDoctor) {
      setFormError('Selecciona un doctor.')
      return
    }
    setSaving(true)
    const result = addSchedules({
      doctorId: selectedDoctor.id,
      weekdays,
      start,
      end,
    })
    setSaving(false)
    if (!result.ok) {
      setFormError(result.error ?? 'No se pudo asignar el horario.')
      return
    }
    toast(
      `Horario asignado a ${result.added} día${result.added === 1 ? '' : 's'}.`,
      'success',
    )
    setFormOpen(false)
    setFormError('')
  }

  const handleDelete = () => {
    if (!blockToDelete) return
    const result = deleteSchedule(blockToDelete.id)
    setBlockToDelete(null)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo eliminar el bloque.', 'error')
      return
    }
    toast('Bloque de horario eliminado.', 'success')
  }

  const openForm = () => {
    setWeekdays([1, 3, 5])
    setStart('09:00')
    setEnd('13:00')
    setFormError('')
    setFormOpen(true)
  }

  const grouped = new Map<string, ScheduleBlock[]>()
  for (const block of doctorBlocks) {
    const key = `${block.start}-${block.end}`
    grouped.set(key, [...(grouped.get(key) ?? []), block])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Horarios"
        title="La agenda de los doctores."
        description="Asigna bloques semanales recurrentes. La disponibilidad pública se calcula con estos horarios y las citas ocupadas."
        actions={
          <Button onClick={openForm} disabled={!selectedDoctor}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Asignar horario
          </Button>
        }
      />

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
          <SelectField
            label="Doctor"
            value={selectedDoctor?.id ?? ''}
            onChange={(event) =>
              setSearchParams({ doctor: event.target.value }, { replace: true })
            }
            hint="La agenda muestra solo los horarios del doctor elegido."
          >
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctorFullName(doctor)} · {doctor.specialty}
              </option>
            ))}
          </SelectField>

          {selectedDoctor ? (
            <div className="flex items-center gap-3 rounded-xl bg-sand/60 px-3 py-2.5">
              <Avatar
                firstName={selectedDoctor.firstName}
                lastName={selectedDoctor.lastNamePaternal}
                color={selectedDoctor.color}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink">
                  {doctorFullName(selectedDoctor)}
                </p>
                <p className="truncate text-[10px] text-ink/45">
                  {summarizeSchedules(data.schedules, selectedDoctor.id).join(' · ') ||
                    'Sin horario asignado'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink/45">
              No hay doctores activos. Activa uno para asignar horarios.
            </p>
          )}
        </div>
      </section>

      {doctors.length === 0 ? (
        <EmptyState
          icon={<CalendarRange className="h-5 w-5" aria-hidden="true" />}
          title="No hay doctores activos"
          description="Activa o registra un doctor antes de asignar horarios."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Horas semanales"
              value={totalWeeklyHours}
              hint={`${doctorBlocks.length} bloques asignados`}
              icon={<Clock className="h-4 w-4" aria-hidden="true" />}
            />
            <StatCard
              label="Citas próximas"
              value={futureAppointments}
              hint="Confirmadas desde hoy"
              icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
              tone="sky"
            />
            <StatCard
              label="Días con atención"
              value={new Set(doctorBlocks.map((block) => block.weekday)).size}
              hint="De lunes a sábado"
              icon={<CalendarRange className="h-4 w-4" aria-hidden="true" />}
              tone="emerald"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.55fr_0.45fr]">
            <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    Semana del doctor
                  </h2>
                  <p className="text-xs text-ink/45">
                    Bloques claros: horario asignado. Oscuros: cita reservada.
                  </p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                  Lun – Sáb
                </span>
              </div>

              <div className="calendar-shell mt-4">
                <FullCalendar
                  key={selectedDoctor?.id ?? 'none'}
                  plugins={calendarPlugins}
                  initialView="timeGridWeek"
                  initialDate={todayISO()}
                  locale={esLocale}
                  height="auto"
                  allDaySlot={false}
                  hiddenDays={[0]}
                  slotMinTime="08:00:00"
                  slotMaxTime="19:00:00"
                  slotDuration="00:30:00"
                  nowIndicator
                  headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'today',
                  }}
                  events={events}
                  datesSet={(arg) => {
                    const nextStart = arg.startStr.slice(0, 10)
                    const nextEnd = arg.endStr.slice(0, 10)
                    setRange((current) =>
                      current.start === nextStart && current.end === nextEnd
                        ? current
                        : { start: nextStart, end: nextEnd },
                    )
                  }}
                  eventClick={(arg) => {
                    const blockId = arg.event.extendedProps.blockId as
                      | string
                      | undefined
                    if (!blockId) return
                    const block = data.schedules.find((item) => item.id === blockId)
                    if (block) setBlockToDelete(block)
                  }}
                  eventContent={(arg) => {
                    const blockId = arg.event.extendedProps.blockId as
                      | string
                      | undefined
                    if (blockId) {
                      const block = data.schedules.find(
                        (item) => item.id === blockId,
                      )
                      if (!block) return null
                      return (
                        <div className="truncate px-1 py-0.5 text-[10px] font-bold leading-4">
                          {formatTime12(block.start)} – {formatTime12(block.end)}
                        </div>
                      )
                    }
                    const patient = arg.event.extendedProps.patient as
                      | string
                      | undefined
                    return (
                      <div className="truncate px-1 py-0.5 text-[10px] font-bold leading-4">
                        {patient ?? arg.event.title}
                      </div>
                    )
                  }}
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }}
                  noEventsContent="Este doctor no tiene horarios asignados."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
              <h2 className="font-display text-xl font-semibold text-ink">
                Bloques recurrentes
              </h2>
              <p className="mt-1 text-xs leading-5 text-ink/45">
                Toca la X de un día para quitarlo del horario.
              </p>

              {grouped.size === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-line bg-sand/40 px-3 py-6 text-center">
                  <p className="text-xs font-semibold text-ink/55">
                    Sin horarios asignados
                  </p>
                  <Button size="sm" className="mt-3" onClick={openForm}>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Asignar horario
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {[...grouped.entries()]
                    .sort(
                      ([rangeA], [rangeB]) =>
                        timeToMinutes(rangeA.split('-')[0]) -
                        timeToMinutes(rangeB.split('-')[0]),
                    )
                    .map(([rangeKey, blocks]) => {
                      const [rangeStart, rangeEnd] = rangeKey.split('-')
                      return (
                        <div
                          key={rangeKey}
                          className="rounded-xl border border-line/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-ink">
                              {formatTime12(rangeStart)} – {formatTime12(rangeEnd)}
                            </p>
                            <span className="text-[10px] font-semibold text-ink/40">
                              {blocks.length} día{blocks.length === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {blocks
                              .sort((a, b) => a.weekday - b.weekday)
                              .map((block) => {
                                const label =
                                  WEEKDAYS.find(
                                    (day) => day.value === block.weekday,
                                  )?.short ?? ''
                                return (
                                  <span
                                    key={block.id}
                                    className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 py-1 pl-2.5 pr-1 text-[10px] font-bold text-brand-800"
                                  >
                                    {label}
                                    <button
                                      type="button"
                                      onClick={() => setBlockToDelete(block)}
                                      className="grid h-4 w-4 place-items-center rounded-full text-brand-600 transition hover:bg-brand-200 hover:text-brand-900"
                                      aria-label={`Eliminar bloque del ${label}`}
                                    >
                                      <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
                                    </button>
                                  </span>
                                )
                              })}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                No se puede eliminar un bloque con citas futuras confirmadas.
              </div>
            </section>
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Asignar horario"
        description={
          selectedDoctor
            ? `Bloque recurrente para ${doctorFullName(selectedDoctor)}.`
            : 'Selecciona un doctor para continuar.'
        }
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} loading={saving}>
              Asignar horario
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Días de atención</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = weekdays.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      setWeekdays((current) =>
                        current.includes(day.value)
                          ? current.filter((value) => value !== day.value)
                          : [...current, day.value],
                      )
                      setFormError('')
                    }}
                    aria-pressed={active}
                    className={clsx(
                      'rounded-full border px-3.5 py-2 text-xs font-bold transition',
                      active
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-line bg-paper text-ink/55 hover:border-brand-300 hover:text-ink',
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] text-ink/40">
              El domingo no está disponible. La posta atiende de lunes a sábado.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Hora de inicio"
              required
              value={start}
              onChange={(event) => {
                setStart(event.target.value)
                setFormError('')
              }}
            >
              {TIME_OPTIONS.filter((time) => time !== CLINIC_CLOSE_TIME).map(
                (time) => (
                  <option key={time} value={time}>
                    {formatTime12(time)}
                  </option>
                ),
              )}
            </SelectField>
            <SelectField
              label="Hora de fin"
              required
              value={end}
              onChange={(event) => {
                setEnd(event.target.value)
                setFormError('')
              }}
            >
              {TIME_OPTIONS.filter((time) => time !== CLINIC_OPEN_TIME).map(
                (time) => (
                  <option key={time} value={time}>
                    {formatTime12(time)}
                  </option>
                ),
              )}
            </SelectField>
          </div>

          <div className="rounded-xl bg-sand/70 px-3.5 py-3 text-[11px] leading-5 text-ink/55">
            Cada cita dura 30 minutos. Los cupos se generan automáticamente dentro
            del bloque y se bloquean al reservar.
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
            >
              {formError}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={blockToDelete !== null}
        onClose={() => setBlockToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar bloque de horario"
        description={
          blockToDelete ? (
            <>
              Se quitará el bloque del{' '}
              <strong>
                {WEEKDAYS.find((day) => day.value === blockToDelete.weekday)?.label} de{' '}
                {formatTime12(blockToDelete.start)} a {formatTime12(blockToDelete.end)}
              </strong>
              . Los cupos libres de este bloque dejarán de mostrarse.
            </>
          ) : null
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Mantener"
      />
    </div>
  )
}
