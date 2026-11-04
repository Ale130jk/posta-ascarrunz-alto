import { useEffect, useState, type FormEvent } from 'react'
import { BadgeCheck, Check, UserRound } from 'lucide-react'
import clsx from 'clsx'
import type { Doctor, DoctorInput } from '../../types'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { TextAreaField, TextField, SelectField } from '../../components/ui/Fields'
import {
  DOCTOR_COLORS,
  SPECIALTIES,
} from '../../lib/constants'
import {
  validateDoctorInput,
  type FieldErrors,
} from '../../lib/validation'

const emptyDoctor: DoctorInput = {
  prefix: 'Dra.',
  firstName: '',
  lastNamePaternal: '',
  lastNameMaternal: '',
  specialty: SPECIALTIES[0],
  email: '',
  phone: '',
  license: '',
  bio: '',
  color: 'teal',
}

function toInput(doctor: Doctor): DoctorInput {
  return {
    prefix: doctor.prefix,
    firstName: doctor.firstName,
    lastNamePaternal: doctor.lastNamePaternal,
    lastNameMaternal: doctor.lastNameMaternal,
    specialty: doctor.specialty,
    email: doctor.email,
    phone: doctor.phone,
    license: doctor.license,
    bio: doctor.bio,
    color: doctor.color,
  }
}

export function DoctorFormModal({
  open,
  doctor,
  onClose,
}: {
  open: boolean
  doctor: Doctor | null
  onClose: () => void
}) {
  const { registerDoctor, updateDoctor } = useClinic()
  const toast = useToast()
  const [form, setForm] = useState<DoctorInput>(emptyDoctor)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(doctor ? toInput(doctor) : emptyDoctor)
    setErrors({})
    setFormError('')
  }, [open, doctor])

  const update = (field: keyof DoctorInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    const nextErrors = validateDoctorInput(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    const result = doctor
      ? updateDoctor(doctor.id, form)
      : registerDoctor(form)
    setSaving(false)

    if (!result.ok) {
      const message = result.error ?? 'No se pudo guardar el doctor.'
      if (message.toLowerCase().includes('correo')) {
        setErrors((current) => ({ ...current, email: message }))
      } else {
        setFormError(message)
      }
      return
    }

    toast(
      doctor
        ? 'Datos del doctor actualizados.'
        : 'Doctor registrado. Ahora asigna su horario.',
      'success',
    )
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doctor ? 'Editar doctor' : 'Registrar doctor'}
      description={
        doctor
          ? 'Actualiza la información del profesional.'
          : 'Completa los datos del profesional. Después podrás asignarle horarios.'
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="doctor-form" loading={saving}>
            <Check className="h-4 w-4" aria-hidden="true" />
            {doctor ? 'Guardar cambios' : 'Registrar doctor'}
          </Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-3.5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-xs leading-5 text-brand-900/65">
            Solo se aceptan letras en nombres y apellidos. El correo y el teléfono
            se validan antes de guardar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[0.45fr_1fr]">
          <SelectField
            label="Tratamiento"
            required
            value={form.prefix}
            onChange={(event) => update('prefix', event.target.value)}
            error={errors.prefix}
          >
            <option value="Dra.">Dra.</option>
            <option value="Dr.">Dr.</option>
          </SelectField>
          <SelectField
            label="Especialidad"
            required
            value={form.specialty}
            onChange={(event) => update('specialty', event.target.value)}
            error={errors.specialty}
          >
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          label="Nombres"
          required
          value={form.firstName}
          onChange={(event) => update('firstName', event.target.value)}
          error={errors.firstName}
          placeholder="Ej. Rosa Elena"
          autoComplete="off"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Apellido paterno"
            required
            value={form.lastNamePaternal}
            onChange={(event) => update('lastNamePaternal', event.target.value)}
            error={errors.lastNamePaternal}
            placeholder="Ej. Quispe"
          />
          <TextField
            label="Apellido materno"
            required
            value={form.lastNameMaternal}
            onChange={(event) => update('lastNameMaternal', event.target.value)}
            error={errors.lastNameMaternal}
            placeholder="Ej. Huamán"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Correo"
            type="email"
            required
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            error={errors.email}
            placeholder="doctor@postaascarrunz.pe"
          />
          <TextField
            label="Teléfono"
            type="tel"
            inputMode="numeric"
            maxLength={9}
            required
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            error={errors.phone}
            placeholder="9XXXXXXXX"
          />
        </div>

        <TextField
          label="Colegiatura"
          value={form.license}
          onChange={(event) => update('license', event.target.value)}
          error={errors.license}
          placeholder="Ej. CMP 045612"
          hint="Opcional. Se mostrará en el perfil público del doctor."
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Color del perfil</p>
          <div className="flex flex-wrap gap-2">
            {DOCTOR_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => update('color', color.value)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition',
                  form.color === color.value
                    ? 'border-brand-500 bg-brand-50 text-brand-900'
                    : 'border-line bg-white text-ink/55 hover:border-brand-300',
                )}
                aria-pressed={form.color === color.value}
              >
                <span className={clsx('h-3 w-3 rounded-full', color.swatch)} aria-hidden="true" />
                {color.label}
              </button>
            ))}
          </div>
          {errors.color && <p className="mt-1.5 text-xs text-red-600">{errors.color}</p>}
        </div>

        <TextAreaField
          label="Reseña breve"
          rows={3}
          value={form.bio}
          onChange={(event) => update('bio', event.target.value)}
          error={errors.bio}
          placeholder="Ej. Medicina familiar y control de enfermedades crónicas."
          maxLength={240}
          hint={`${form.bio.length}/240 caracteres`}
        />

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-sand/50 p-3 text-[11px] leading-5 text-ink/50">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          El doctor aparecerá en la página principal cuando esté activo. Asigna
          un horario para que los pacientes puedan reservar con él.
        </div>
      </form>
    </Modal>
  )
}
