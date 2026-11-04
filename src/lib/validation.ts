import type {
  ContactInput,
  DoctorInput,
  Patient,
  PatientProfileInput,
} from '../types'
import { DOCTOR_COLORS, SPECIALTIES } from './constants'

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '’-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DNI_PATTERN = /^\d{8}$/
const PHONE_PATTERN = /^\d{9}$/
const LICENSE_PATTERN = /^[A-Za-z0-9 .-]{3,24}$/

export type FieldErrors = Record<string, string>

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function isValidName(value: string): boolean {
  const name = normalizeName(value)
  return name.length >= 2 && name.length <= 60 && NAME_PATTERN.test(name)
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidDni(value: string): boolean {
  return DNI_PATTERN.test(value.trim())
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim())
}

export function validatePatientProfile(
  input: PatientProfileInput,
): FieldErrors {
  const errors: FieldErrors = {}

  if (!isValidName(input.firstName)) {
    errors.firstName = 'Ingresa tus nombres. Solo se aceptan letras y espacios.'
  }
  if (!isValidName(input.lastNamePaternal)) {
    errors.lastNamePaternal = 'Ingresa tu apellido paterno. Solo se aceptan letras.'
  }
  if (!isValidName(input.lastNameMaternal)) {
    errors.lastNameMaternal = 'Ingresa tu apellido materno. Solo se aceptan letras.'
  }
  if (!isValidDni(input.dni)) {
    errors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos.'
  }
  if (!isValidPhone(input.phone)) {
    errors.phone = 'El teléfono debe tener 9 dígitos numéricos.'
  }

  return errors
}

export function isProfileComplete(patient: Patient): boolean {
  return (
    isValidEmail(patient.email) &&
    Object.keys(
      validatePatientProfile({
        firstName: patient.firstName,
        lastNamePaternal: patient.lastNamePaternal,
        lastNameMaternal: patient.lastNameMaternal,
        dni: patient.dni,
        phone: patient.phone,
      }),
    ).length === 0
  )
}

export function validateDoctorInput(input: DoctorInput): FieldErrors {
  const errors: FieldErrors = {}

  if (input.prefix !== 'Dr.' && input.prefix !== 'Dra.') {
    errors.prefix = 'Selecciona el tratamiento.'
  }
  if (!isValidName(input.firstName)) {
    errors.firstName = 'Ingresa los nombres. No se permiten números ni símbolos.'
  }
  if (!isValidName(input.lastNamePaternal)) {
    errors.lastNamePaternal = 'Ingresa el apellido paterno. No se permiten números.'
  }
  if (!isValidName(input.lastNameMaternal)) {
    errors.lastNameMaternal = 'Ingresa el apellido materno. No se permiten números.'
  }
  if (
    !SPECIALTIES.includes(input.specialty as (typeof SPECIALTIES)[number])
  ) {
    errors.specialty = 'Selecciona una especialidad válida.'
  }
  if (!isValidEmail(input.email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }
  if (!isValidPhone(input.phone)) {
    errors.phone = 'El teléfono debe tener 9 dígitos numéricos.'
  }
  if (input.license.trim() && !LICENSE_PATTERN.test(input.license.trim())) {
    errors.license = 'Usa entre 3 y 24 caracteres: letras, números o guiones.'
  }
  if (input.bio.length > 240) {
    errors.bio = 'La reseña no debe superar los 240 caracteres.'
  }
  if (!DOCTOR_COLORS.some((color) => color.value === input.color)) {
    errors.color = 'Selecciona un color para el perfil.'
  }

  return errors
}

export function validateContactInput(input: ContactInput): FieldErrors {
  const errors: FieldErrors = {}

  if (input.name.trim().length < 2 || input.name.trim().length > 80) {
    errors.name = 'Ingresa tu nombre completo.'
  }
  if (!isValidEmail(input.email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }
  if (input.phone.trim() && !isValidPhone(input.phone)) {
    errors.phone = 'Si ingresas un teléfono, debe tener 9 dígitos.'
  }
  if (input.message.trim().length < 10) {
    errors.message = 'Cuéntanos tu consulta con al menos 10 caracteres.'
  }
  if (input.message.trim().length > 600) {
    errors.message = 'El mensaje no debe superar los 600 caracteres.'
  }

  return errors
}

export function validateReason(reason: string): string | null {
  const value = reason.trim()
  if (value.length > 0 && value.length < 4) {
    return 'Describe el motivo con al menos 4 caracteres.'
  }
  if (value.length > 200) {
    return 'El motivo no debe superar los 200 caracteres.'
  }
  return null
}
