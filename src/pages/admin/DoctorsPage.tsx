import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarRange,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader, StatCard, EmptyState } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { Pill } from '../../components/ui/Badge'
import { Button, buttonStyles } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SelectField, TextField } from '../../components/ui/Fields'
import { DoctorFormModal } from '../../components/admin/DoctorFormModal'
import { SPECIALTIES } from '../../lib/constants'
import { todayISO } from '../../lib/dates'
import { doctorFullName } from '../../lib/names'
import { summarizeSchedules } from '../../lib/availability'
import type { Doctor } from '../../types'

export function DoctorsPage() {
  const { data, setDoctorActive } = useClinic()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Doctor | null>(null)

  useEffect(() => {
    if (searchParams.get('nuevo') !== '1') return
    setEditing(null)
    setFormOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('nuevo')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.doctors.filter((doctor) => {
      if (specialty && doctor.specialty !== specialty) return false
      if (status === 'active' && !doctor.active) return false
      if (status === 'inactive' && doctor.active) return false
      if (!needle) return true
      return [
        doctorFullName(doctor),
        doctor.email,
        doctor.license,
        doctor.specialty,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [data.doctors, query, specialty, status])

  const activeCount = data.doctors.filter((doctor) => doctor.active).length
  const withoutSchedule = data.doctors.filter(
    (doctor) =>
      doctor.active &&
      !data.schedules.some((block) => block.doctorId === doctor.id),
  ).length

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (doctor: Doctor) => {
    setEditing(doctor)
    setFormOpen(true)
  }

  const handleToggle = () => {
    if (!toggleTarget) return
    const result = setDoctorActive(toggleTarget.id, !toggleTarget.active)
    setToggleTarget(null)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo actualizar el doctor.', 'error')
      return
    }
    toast(
      toggleTarget.active
        ? 'Doctor desactivado. Ya no aparece para reservas.'
        : 'Doctor activado. Puede recibir reservas.',
      'success',
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctores"
        title="El equipo de la posta."
        description="Registra profesionales, actualiza sus datos y decide quién aparece en la agenda pública."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar doctor
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Doctores activos"
          value={activeCount}
          hint={`${data.doctors.length} registrados en total`}
          icon={<UserRoundCheck className="h-4 w-4" aria-hidden="true" />}
          tone="emerald"
        />
        <StatCard
          label="Sin horario"
          value={withoutSchedule}
          hint="Activos que aún no tienen bloques"
          icon={<CalendarRange className="h-4 w-4" aria-hidden="true" />}
          tone="amber"
        />
        <StatCard
          label="Especialidades"
          value={new Set(data.doctors.map((doctor) => doctor.specialty)).size}
          hint="Áreas de atención registradas"
          icon={<UsersRound className="h-4 w-4" aria-hidden="true" />}
          tone="sky"
        />
      </div>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="relative">
            <TextField
              label="Buscar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, correo o colegiatura"
              className="pl-9"
              containerClassName="w-full"
            />
            <Search
              className="pointer-events-none absolute left-3 top-[2.4rem] h-4 w-4 text-ink/35"
              aria-hidden="true"
            />
          </div>
          <SelectField
            label="Especialidad"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
          >
            <option value="">Todas</option>
            {SPECIALTIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Estado"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'all' | 'active' | 'inactive')
            }
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </SelectField>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-ink/45">
            {filtered.length} de {data.doctors.length} doctores
          </p>
          {(query || specialty || status !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSpecialty('')
                setStatus('all')
              }}
              className="text-xs font-bold text-brand-700 hover:text-brand-900"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-5 w-5" aria-hidden="true" />}
          title="No hay doctores con esos filtros"
          description="Prueba con otra búsqueda o registra un nuevo profesional."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Registrar doctor
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doctor) => {
            const schedule = summarizeSchedules(data.schedules, doctor.id)
            const upcoming = data.appointments.filter(
              (appointment) =>
                appointment.doctorId === doctor.id &&
                appointment.status === 'confirmed' &&
                appointment.date >= todayISO(),
            ).length

            return (
              <article
                key={doctor.id}
                className={clsx(
                  'flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm shadow-ink/[0.02]',
                  doctor.active ? 'border-line' : 'border-line/70 opacity-80',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar
                      firstName={doctor.firstName}
                      lastName={doctor.lastNamePaternal}
                      color={doctor.color}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-semibold leading-tight text-ink">
                        {doctorFullName(doctor)}
                      </h2>
                      <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-brand-700">
                        {doctor.specialty}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-ink/45">
                        {doctor.license || 'Colegiatura pendiente'}
                      </p>
                    </div>
                  </div>
                  <Pill tone={doctor.active ? 'green' : 'neutral'}>
                    {doctor.active ? 'Activo' : 'Inactivo'}
                  </Pill>
                </div>

                <dl className="mt-4 space-y-1.5 border-t border-line/70 pt-3 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink/40">Correo</dt>
                    <dd className="truncate font-semibold text-ink/75">
                      {doctor.email}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink/40">Teléfono</dt>
                    <dd className="font-semibold text-ink/75">{doctor.phone}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink/40">Citas próximas</dt>
                    <dd className="font-semibold text-ink/75">{upcoming}</dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-xl bg-sand/60 px-3 py-2">
                  {schedule.length > 0 ? (
                    schedule.slice(0, 3).map((line) => (
                      <p
                        key={line}
                        className="text-[10px] font-semibold leading-5 text-ink/55"
                      >
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-[10px] font-semibold text-amber-700">
                      Sin horario asignado
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => openEdit(doctor)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setToggleTarget(doctor)}
                    className={clsx(
                      doctor.active
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
                    )}
                  >
                    {doctor.active ? (
                      <UserRoundX className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {doctor.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <a
                    href={`/admin/horarios?doctor=${doctor.id}`}
                    className={buttonStyles({
                      variant: 'ghost',
                      size: 'sm',
                      className: 'ml-auto',
                    })}
                  >
                    <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
                    Horario
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <DoctorFormModal
        open={formOpen}
        doctor={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={toggleTarget !== null}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.active ? 'Desactivar doctor' : 'Activar doctor'}
        description={
          toggleTarget ? (
            <>
              {toggleTarget.active ? (
                <>
                  <strong>{doctorFullName(toggleTarget)}</strong> dejará de aparecer
                  en la agenda pública y no podrá recibir nuevas reservas. Las citas
                  ya confirmadas se mantienen.
                </>
              ) : (
                <>
                  <strong>{doctorFullName(toggleTarget)}</strong> volverá a aparecer
                  en la agenda pública según sus horarios asignados.
                </>
              )}
            </>
          ) : null
        }
        confirmLabel={toggleTarget?.active ? 'Sí, desactivar' : 'Sí, activar'}
        tone={toggleTarget?.active ? 'danger' : 'primary'}
      />
    </div>
  )
}
