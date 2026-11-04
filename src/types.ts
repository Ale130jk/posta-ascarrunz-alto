export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DoctorColor = 'teal' | 'rose' | 'amber' | 'sky' | 'emerald' | 'violet'

export type DoctorPrefix = 'Dr.' | 'Dra.'

export interface Patient {
  id: string
  email: string
  dni: string
  firstName: string
  lastNamePaternal: string
  lastNameMaternal: string
  phone: string
  createdAt: string
}

export interface Doctor {
  id: string
  prefix: DoctorPrefix
  firstName: string
  lastNamePaternal: string
  lastNameMaternal: string
  specialty: string
  email: string
  phone: string
  license: string
  bio: string
  color: DoctorColor
  active: boolean
  createdAt: string
}

export interface ScheduleBlock {
  id: string
  doctorId: string
  weekday: Weekday
  start: string
  end: string
}

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  start: string
  end: string
  reason: string
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
  read: boolean
}

export interface ClinicData {
  version: 1
  patients: Patient[]
  doctors: Doctor[]
  schedules: ScheduleBlock[]
  appointments: Appointment[]
  messages: ContactMessage[]
}

export interface Session {
  patientId: string | null
  admin: boolean
}

export interface PatientProfileInput {
  firstName: string
  lastNamePaternal: string
  lastNameMaternal: string
  dni: string
  phone: string
}

export interface DoctorInput {
  prefix: DoctorPrefix
  firstName: string
  lastNamePaternal: string
  lastNameMaternal: string
  specialty: string
  email: string
  phone: string
  license: string
  bio: string
  color: DoctorColor
}

export interface BookingInput {
  doctorId: string
  date: string
  start: string
  reason: string
}

export interface ScheduleBatchInput {
  doctorId: string
  weekdays: Weekday[]
  start: string
  end: string
}

export interface ContactInput {
  name: string
  email: string
  phone: string
  message: string
}

export interface ActionResult {
  ok: boolean
  error?: string
}

export interface BookingResult extends ActionResult {
  appointment?: Appointment
}

export interface ScheduleResult extends ActionResult {
  added?: number
}

export interface Slot {
  start: string
  end: string
}
