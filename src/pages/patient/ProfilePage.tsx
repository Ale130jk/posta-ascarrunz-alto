import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader } from '../../components/ui/Page'
import { Avatar } from '../../components/ui/Avatar'
import { Button, buttonStyles } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Fields'
import { formatLongDate } from '../../lib/dates'
import { patientFullName } from '../../lib/names'
import {
  validatePatientProfile,
  type FieldErrors,
} from '../../lib/validation'
import type { PatientProfileInput } from '../../types'

export function ProfilePage() {
  const { patient, updatePatientProfile } = useClinic()
  const toast = useToast()

  const [form, setForm] = useState<PatientProfileInput>({
    firstName: patient?.firstName ?? '',
    lastNamePaternal: patient?.lastNamePaternal ?? '',
    lastNameMaternal: patient?.lastNameMaternal ?? '',
    dni: patient?.dni ?? '',
    phone: patient?.phone ?? '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  if (!patient) return null

  const update = (field: keyof PatientProfileInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validatePatientProfile(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    const result = updatePatientProfile(form)
    setSaving(false)
    if (!result.ok) {
      toast(result.error ?? 'No se pudieron guardar los cambios.', 'error')
      return
    }
    toast('Tus datos se actualizaron correctamente.', 'success')
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
        eyebrow="Mis datos"
        title="Tus datos de atención."
        description="La posta usará esta información para identificarte y contactarte por tu cita."
        actions={
          <Link
            to="/mi-cuenta/citas"
            className={buttonStyles({ variant: 'outline', size: 'md' })}
          >
            Ver mis citas
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02] sm:p-6"
          noValidate
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Datos personales
              </h2>
              <p className="text-xs text-ink/45">Los campos con * son obligatorios.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <TextField
              label="Nombres"
              required
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              error={errors.firstName}
              autoComplete="given-name"
              hint="Solo letras, tildes y espacios."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Apellido paterno"
                required
                value={form.lastNamePaternal}
                onChange={(event) => update('lastNamePaternal', event.target.value)}
                error={errors.lastNamePaternal}
                autoComplete="family-name"
              />
              <TextField
                label="Apellido materno"
                required
                value={form.lastNameMaternal}
                onChange={(event) => update('lastNameMaternal', event.target.value)}
                error={errors.lastNameMaternal}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="DNI"
                required
                inputMode="numeric"
                maxLength={8}
                value={form.dni}
                onChange={(event) => update('dni', event.target.value)}
                error={errors.dni}
                hint="Exactamente 8 dígitos."
              />
              <TextField
                label="Celular"
                type="tel"
                required
                inputMode="numeric"
                maxLength={9}
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                error={errors.phone}
                hint="9 dígitos, sin espacios."
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/mi-cuenta"
              className={buttonStyles({ variant: 'outline', size: 'md' })}
            >
              Cancelar
            </Link>
            <Button type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02]">
            <div className="flex items-center gap-3">
              <Avatar
                firstName={patient.firstName}
                lastName={patient.lastNamePaternal}
                size="lg"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-ink">
                  {patientFullName(patient)}
                </p>
                <p className="truncate text-xs text-ink/45">Paciente de la posta</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-xs">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-ink/40">Correo de acceso</dt>
                  <dd className="break-all font-semibold text-ink">{patient.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-ink/40">Registro</dt>
                  <dd className="font-semibold text-ink">
                    {formatLongDate(patient.createdAt.slice(0, 10), true)}
                  </dd>
                </div>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-sand/70 px-3 py-2.5 text-[10px] leading-4 text-ink/45">
              El correo identifica tu cuenta y no se puede cambiar desde aquí.
            </p>
          </section>

          <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-brand-900/65">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
            <p className="text-[11px] leading-5">
              Tu DNI debe coincidir con el documento que presentarás en recepción.
              Si necesitas corregir un dato, acércate a la posta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
