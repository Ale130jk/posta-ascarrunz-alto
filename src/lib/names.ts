import type { Doctor } from '../types'

export function patientFullName(patient: {
  firstName: string
  lastNamePaternal: string
  lastNameMaternal: string
}): string {
  return [patient.firstName, patient.lastNamePaternal, patient.lastNameMaternal]
    .filter(Boolean)
    .join(' ')
}

export function doctorFullName(doctor: Doctor): string {
  return [doctor.prefix, doctor.firstName, doctor.lastNamePaternal, doctor.lastNameMaternal]
    .filter(Boolean)
    .join(' ')
}

export function initials(name: string, lastName?: string): string {
  const first = name.trim().charAt(0)
  const second = (lastName ?? name.trim().split(/\s+/)[1] ?? '').charAt(0)
  return `${first}${second}`.toUpperCase()
}

export function appointmentCode(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
}
