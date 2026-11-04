import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActionResult,
  Appointment,
  BookingInput,
  BookingResult,
  ClinicData,
  ContactInput,
  Doctor,
  DoctorInput,
  Patient,
  PatientProfileInput,
  ScheduleBatchInput,
  ScheduleResult,
  Session,
} from '../types'
import {
  CLINIC,
  CLINIC_CLOSE_MINUTES,
  CLINIC_OPEN_MINUTES,
  WEEKDAY_LABELS,
} from '../lib/constants'
import {
  getAvailableSlots,
  isDateWithinHorizon,
  patientHasOverlap,
} from '../lib/availability'
import {
  appointmentDateTime,
  canPatientCancel,
  todayISO,
  weekdayOf,
} from '../lib/dates'
import { createId } from '../lib/id'
import { loadData, loadSession, saveData, saveSession } from '../lib/storage'
import {
  isProfileComplete,
  isValidEmail,
  validateContactInput,
  validateDoctorInput,
  validatePatientProfile,
  validateReason,
  normalizeName,
} from '../lib/validation'

interface LoginResult extends ActionResult {
  patient?: Patient
  needsProfile?: boolean
}

interface DoctorResult extends ActionResult {
  id?: string
}

interface ClinicContextValue {
  data: ClinicData
  session: Session
  patient: Patient | null
  isAdmin: boolean
  loginPatient: (email: string) => LoginResult
  logoutPatient: () => void
  updatePatientProfile: (input: PatientProfileInput) => ActionResult
  adminLogin: (email: string, password: string) => ActionResult
  adminLogout: () => void
  registerDoctor: (input: DoctorInput) => DoctorResult
  updateDoctor: (id: string, input: DoctorInput) => ActionResult
  setDoctorActive: (id: string, active: boolean) => ActionResult
  addSchedules: (input: ScheduleBatchInput) => ScheduleResult
  deleteSchedule: (id: string) => ActionResult
  bookAppointment: (input: BookingInput) => BookingResult
  rescheduleAppointment: (id: string, input: BookingInput) => BookingResult
  cancelAppointment: (id: string, byAdmin?: boolean) => ActionResult
  completeAppointment: (id: string) => ActionResult
  addMessage: (input: ContactInput) => ActionResult
  markMessageRead: (id: string) => ActionResult
  markAllMessagesRead: () => ActionResult
  deleteMessage: (id: string) => ActionResult
}

const ClinicContext = createContext<ClinicContextValue | null>(null)

function validateScheduleTimes(start: string, end: string): string | null {
  if (!start || !end) return 'Selecciona la hora de inicio y de fin.'
  const startMinutes = Number(start.split(':')[0]) * 60 + Number(start.split(':')[1])
  const endMinutes = Number(end.split(':')[0]) * 60 + Number(end.split(':')[1])
  if (
    Number.isNaN(startMinutes) ||
    Number.isNaN(endMinutes) ||
    startMinutes >= endMinutes
  ) {
    return 'La hora de fin debe ser mayor que la hora de inicio.'
  }
  if (startMinutes < CLINIC_OPEN_MINUTES || endMinutes > CLINIC_CLOSE_MINUTES) {
    return 'El horario debe estar dentro de la atención: 9:00 a. m. a 6:00 p. m.'
  }
  if (startMinutes % 30 !== 0 || endMinutes % 30 !== 0) {
    return 'Los horarios deben ir en bloques de 30 minutos.'
  }
  return null
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicData>(() => loadData())
  const [session, setSession] = useState<Session>(() => loadSession())
  const dataRef = useRef(data)
  const sessionRef = useRef(session)

  const commitData = useCallback((next: ClinicData) => {
    dataRef.current = next
    setData(next)
    saveData(next)
  }, [])

  const commitSession = useCallback((next: Session) => {
    sessionRef.current = next
    setSession(next)
    saveSession(next)
  }, [])

  const patient = useMemo(
    () =>
      data.patients.find((item) => item.id === session.patientId) ?? null,
    [data.patients, session.patientId],
  )

  const loginPatient = useCallback(
    (email: string): LoginResult => {
      const normalized = email.trim().toLowerCase()
      if (!isValidEmail(normalized)) {
        return { ok: false, error: 'Ingresa un correo electrónico válido.' }
      }

      const current = dataRef.current
      let found = current.patients.find((item) => item.email === normalized)
      if (!found) {
        found = {
          id: createId('pat'),
          email: normalized,
          dni: '',
          firstName: '',
          lastNamePaternal: '',
          lastNameMaternal: '',
          phone: '',
          createdAt: new Date().toISOString(),
        }
        commitData({
          ...current,
          patients: [...current.patients, found],
        })
      }

      commitSession({ ...sessionRef.current, patientId: found.id })
      return {
        ok: true,
        patient: found,
        needsProfile: !isProfileComplete(found),
      }
    },
    [commitData, commitSession],
  )

  const logoutPatient = useCallback(() => {
    commitSession({ ...sessionRef.current, patientId: null })
  }, [commitSession])

  const updatePatientProfile = useCallback(
    (input: PatientProfileInput): ActionResult => {
      const currentPatient = dataRef.current.patients.find(
        (item) => item.id === sessionRef.current.patientId,
      )
      if (!currentPatient) {
        return { ok: false, error: 'Inicia sesión para actualizar tus datos.' }
      }

      const errors = validatePatientProfile(input)
      const firstError = Object.values(errors)[0]
      if (firstError) return { ok: false, error: firstError }

      const nextPatient: Patient = {
        ...currentPatient,
        firstName: normalizeName(input.firstName),
        lastNamePaternal: normalizeName(input.lastNamePaternal),
        lastNameMaternal: normalizeName(input.lastNameMaternal),
        dni: input.dni.trim(),
        phone: input.phone.trim(),
      }

      commitData({
        ...dataRef.current,
        patients: dataRef.current.patients.map((item) =>
          item.id === nextPatient.id ? nextPatient : item,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const adminLogin = useCallback(
    (email: string, password: string): ActionResult => {
      if (
        email.trim().toLowerCase() !== CLINIC.adminEmail ||
        password !== CLINIC.adminPassword
      ) {
        return { ok: false, error: 'Correo o contraseña incorrectos.' }
      }
      commitSession({ ...sessionRef.current, admin: true })
      return { ok: true }
    },
    [commitSession],
  )

  const adminLogout = useCallback(() => {
    commitSession({ ...sessionRef.current, admin: false })
  }, [commitSession])

  const registerDoctor = useCallback(
    (input: DoctorInput): DoctorResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      const errors = validateDoctorInput(input)
      const firstError = Object.values(errors)[0]
      if (firstError) return { ok: false, error: firstError }

      const email = input.email.trim().toLowerCase()
      if (
        dataRef.current.doctors.some(
          (doctor) => doctor.email.toLowerCase() === email,
        )
      ) {
        return { ok: false, error: 'Ya existe un doctor con ese correo.' }
      }

      const doctor: Doctor = {
        id: createId('doc'),
        prefix: input.prefix,
        firstName: normalizeName(input.firstName),
        lastNamePaternal: normalizeName(input.lastNamePaternal),
        lastNameMaternal: normalizeName(input.lastNameMaternal),
        specialty: input.specialty,
        email,
        phone: input.phone.trim(),
        license: input.license.trim(),
        bio: input.bio.trim(),
        color: input.color,
        active: true,
        createdAt: new Date().toISOString(),
      }

      commitData({
        ...dataRef.current,
        doctors: [...dataRef.current.doctors, doctor],
      })
      return { ok: true, id: doctor.id }
    },
    [commitData],
  )

  const updateDoctor = useCallback(
    (id: string, input: DoctorInput): ActionResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      const existing = dataRef.current.doctors.find((doctor) => doctor.id === id)
      if (!existing) return { ok: false, error: 'Doctor no encontrado.' }

      const errors = validateDoctorInput(input)
      const firstError = Object.values(errors)[0]
      if (firstError) return { ok: false, error: firstError }

      const email = input.email.trim().toLowerCase()
      if (
        dataRef.current.doctors.some(
          (doctor) => doctor.id !== id && doctor.email.toLowerCase() === email,
        )
      ) {
        return { ok: false, error: 'Ya existe otro doctor con ese correo.' }
      }

      const nextDoctor: Doctor = {
        ...existing,
        prefix: input.prefix,
        firstName: normalizeName(input.firstName),
        lastNamePaternal: normalizeName(input.lastNamePaternal),
        lastNameMaternal: normalizeName(input.lastNameMaternal),
        specialty: input.specialty,
        email,
        phone: input.phone.trim(),
        license: input.license.trim(),
        bio: input.bio.trim(),
        color: input.color,
      }

      commitData({
        ...dataRef.current,
        doctors: dataRef.current.doctors.map((doctor) =>
          doctor.id === id ? nextDoctor : doctor,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const setDoctorActive = useCallback(
    (id: string, active: boolean): ActionResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      const existing = dataRef.current.doctors.find((doctor) => doctor.id === id)
      if (!existing) return { ok: false, error: 'Doctor no encontrado.' }

      commitData({
        ...dataRef.current,
        doctors: dataRef.current.doctors.map((doctor) =>
          doctor.id === id ? { ...doctor, active } : doctor,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const addSchedules = useCallback(
    (input: ScheduleBatchInput): ScheduleResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      const doctor = dataRef.current.doctors.find(
        (item) => item.id === input.doctorId,
      )
      if (!doctor) return { ok: false, error: 'Selecciona un doctor válido.' }

      const weekdays = [...new Set(input.weekdays)]
      if (weekdays.length === 0) {
        return { ok: false, error: 'Selecciona al menos un día de atención.' }
      }
      if (weekdays.some((day) => day < 1 || day > 6)) {
        return {
          ok: false,
          error: 'La posta atiende de lunes a sábado. El domingo no está disponible.',
        }
      }

      const timeError = validateScheduleTimes(input.start, input.end)
      if (timeError) return { ok: false, error: timeError }

      const startMinutes = Number(input.start.split(':')[0]) * 60 +
        Number(input.start.split(':')[1])
      const endMinutes = Number(input.end.split(':')[0]) * 60 +
        Number(input.end.split(':')[1])

      for (const weekday of weekdays) {
        const overlap = dataRef.current.schedules.find(
          (block) =>
            block.doctorId === doctor.id &&
            block.weekday === weekday &&
            startMinutes <
              Number(block.end.split(':')[0]) * 60 +
                Number(block.end.split(':')[1]) &&
            endMinutes >
              Number(block.start.split(':')[0]) * 60 +
                Number(block.start.split(':')[1]),
        )
        if (overlap) {
          return {
            ok: false,
            error: `${WEEKDAY_LABELS[weekday]} ya tiene el bloque ${overlap.start} – ${overlap.end}. Ajusta el horario o elimínalo primero.`,
          }
        }
      }

      const newBlocks = weekdays.map((weekday) => ({
        id: createId('sch'),
        doctorId: doctor.id,
        weekday,
        start: input.start,
        end: input.end,
      }))

      commitData({
        ...dataRef.current,
        schedules: [...dataRef.current.schedules, ...newBlocks],
      })
      return { ok: true, added: newBlocks.length }
    },
    [commitData],
  )

  const deleteSchedule = useCallback(
    (id: string): ActionResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      const block = dataRef.current.schedules.find((item) => item.id === id)
      if (!block) return { ok: false, error: 'Bloque de horario no encontrado.' }

      const hasFutureAppointments = dataRef.current.appointments.some(
        (appointment) =>
          appointment.doctorId === block.doctorId &&
          appointment.status === 'confirmed' &&
          appointment.date >= todayISO() &&
          weekdayOf(appointment.date) === block.weekday &&
          appointment.start >= block.start &&
          appointment.start < block.end &&
          appointmentDateTime(appointment.date, appointment.start).getTime() >
            Date.now(),
      )

      if (hasFutureAppointments) {
        return {
          ok: false,
          error:
            'Hay citas futuras en este bloque. Reprograma o cancela esas citas antes de eliminarlo.',
        }
      }

      commitData({
        ...dataRef.current,
        schedules: dataRef.current.schedules.filter((item) => item.id !== id),
      })
      return { ok: true }
    },
    [commitData],
  )

  const bookAppointment = useCallback(
    (input: BookingInput): BookingResult => {
      const current = dataRef.current
      const currentPatient = current.patients.find(
        (item) => item.id === sessionRef.current.patientId,
      )
      if (!currentPatient) {
        return { ok: false, error: 'Inicia sesión para reservar una cita.' }
      }
      if (!isProfileComplete(currentPatient)) {
        return {
          ok: false,
          error: 'Completa tus datos personales antes de reservar.',
        }
      }

      const doctor = current.doctors.find((item) => item.id === input.doctorId)
      if (!doctor || !doctor.active) {
        return { ok: false, error: 'El doctor seleccionado no está disponible.' }
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
        return { ok: false, error: 'Selecciona una fecha válida.' }
      }
      if (!isDateWithinHorizon(input.date)) {
        return {
          ok: false,
          error: 'Elige una fecha entre hoy y los próximos 60 días.',
        }
      }

      const reasonError = validateReason(input.reason)
      if (reasonError) return { ok: false, error: reasonError }

      const slots = getAvailableSlots({
        schedules: current.schedules,
        appointments: current.appointments,
        doctorId: doctor.id,
        dateISO: input.date,
      })
      const slot = slots.find((item) => item.start === input.start)
      if (!slot) {
        return {
          ok: false,
          error:
            'Ese horario ya no está disponible. Elige otro día u otra hora.',
        }
      }

      if (
        patientHasOverlap(
          current.appointments,
          currentPatient.id,
          input.date,
          slot.start,
          slot.end,
        )
      ) {
        return {
          ok: false,
          error: 'Ya tienes otra cita reservada en ese mismo horario.',
        }
      }

      const timestamp = new Date().toISOString()
      const appointment: Appointment = {
        id: createId('apt'),
        patientId: currentPatient.id,
        doctorId: doctor.id,
        date: input.date,
        start: slot.start,
        end: slot.end,
        reason: input.reason.trim(),
        status: 'confirmed',
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      commitData({
        ...current,
        appointments: [...current.appointments, appointment],
      })
      return { ok: true, appointment }
    },
    [commitData],
  )

  const rescheduleAppointment = useCallback(
    (id: string, input: BookingInput): BookingResult => {
      const current = dataRef.current
      const currentPatient = current.patients.find(
        (item) => item.id === sessionRef.current.patientId,
      )
      if (!currentPatient) {
        return { ok: false, error: 'Inicia sesión para reprogramar una cita.' }
      }

      const appointment = current.appointments.find((item) => item.id === id)
      if (
        !appointment ||
        appointment.patientId !== currentPatient.id ||
        appointment.status !== 'confirmed'
      ) {
        return { ok: false, error: 'Cita no encontrada o no reprogramable.' }
      }
      if (!canPatientCancel(appointment.date, appointment.start)) {
        return {
          ok: false,
          error:
            'Solo puedes reprogramar hasta 24 horas antes de la cita. Comunícate con la posta.',
        }
      }

      const doctor = current.doctors.find((item) => item.id === input.doctorId)
      if (!doctor || !doctor.active) {
        return { ok: false, error: 'El doctor seleccionado no está disponible.' }
      }
      if (!isDateWithinHorizon(input.date)) {
        return {
          ok: false,
          error: 'Elige una fecha entre hoy y los próximos 60 días.',
        }
      }

      const reasonError = validateReason(input.reason)
      if (reasonError) return { ok: false, error: reasonError }

      const slots = getAvailableSlots({
        schedules: current.schedules,
        appointments: current.appointments,
        doctorId: doctor.id,
        dateISO: input.date,
        ignoreAppointmentId: appointment.id,
      })
      const slot = slots.find((item) => item.start === input.start)
      if (!slot) {
        return {
          ok: false,
          error:
            'Ese horario ya no está disponible. Elige otro día u otra hora.',
        }
      }

      if (
        patientHasOverlap(
          current.appointments,
          currentPatient.id,
          input.date,
          slot.start,
          slot.end,
          appointment.id,
        )
      ) {
        return {
          ok: false,
          error: 'Ya tienes otra cita reservada en ese mismo horario.',
        }
      }

      const updated: Appointment = {
        ...appointment,
        doctorId: doctor.id,
        date: input.date,
        start: slot.start,
        end: slot.end,
        reason: input.reason.trim(),
        updatedAt: new Date().toISOString(),
      }

      commitData({
        ...current,
        appointments: current.appointments.map((item) =>
          item.id === appointment.id ? updated : item,
        ),
      })
      return { ok: true, appointment: updated }
    },
    [commitData],
  )

  const cancelAppointment = useCallback(
    (id: string, byAdmin = false): ActionResult => {
      const current = dataRef.current
      const appointment = current.appointments.find((item) => item.id === id)
      if (!appointment || appointment.status !== 'confirmed') {
        return { ok: false, error: 'La cita no existe o ya no está activa.' }
      }

      if (byAdmin) {
        if (!sessionRef.current.admin) {
          return { ok: false, error: 'No tienes permisos de administración.' }
        }
      } else {
        if (appointment.patientId !== sessionRef.current.patientId) {
          return { ok: false, error: 'No puedes cancelar esta cita.' }
        }
        if (!canPatientCancel(appointment.date, appointment.start)) {
          return {
            ok: false,
            error:
              'Solo puedes cancelar hasta 24 horas antes. Comunícate con la posta para casos urgentes.',
          }
        }
      }

      commitData({
        ...current,
        appointments: current.appointments.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'cancelled',
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const completeAppointment = useCallback(
    (id: string): ActionResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      const current = dataRef.current
      const appointment = current.appointments.find((item) => item.id === id)
      if (!appointment || appointment.status !== 'confirmed') {
        return { ok: false, error: 'La cita no existe o ya no está activa.' }
      }
      commitData({
        ...current,
        appointments: current.appointments.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'completed',
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const addMessage = useCallback(
    (input: ContactInput): ActionResult => {
      const errors = validateContactInput(input)
      const firstError = Object.values(errors)[0]
      if (firstError) return { ok: false, error: firstError }

      commitData({
        ...dataRef.current,
        messages: [
          {
            id: createId('msg'),
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone.trim(),
            message: input.message.trim(),
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...dataRef.current.messages,
        ],
      })
      return { ok: true }
    },
    [commitData],
  )

  const markMessageRead = useCallback(
    (id: string): ActionResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      commitData({
        ...dataRef.current,
        messages: dataRef.current.messages.map((message) =>
          message.id === id ? { ...message, read: true } : message,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const markAllMessagesRead = useCallback((): ActionResult => {
    if (!sessionRef.current.admin) {
      return { ok: false, error: 'No tienes permisos de administración.' }
    }
    commitData({
      ...dataRef.current,
      messages: dataRef.current.messages.map((message) => ({
        ...message,
        read: true,
      })),
    })
    return { ok: true }
  }, [commitData])

  const deleteMessage = useCallback(
    (id: string): ActionResult => {
      if (!sessionRef.current.admin) {
        return { ok: false, error: 'No tienes permisos de administración.' }
      }
      commitData({
        ...dataRef.current,
        messages: dataRef.current.messages.filter(
          (message) => message.id !== id,
        ),
      })
      return { ok: true }
    },
    [commitData],
  )

  const value: ClinicContextValue = {
    data,
    session,
    patient,
    isAdmin: session.admin,
    loginPatient,
    logoutPatient,
    updatePatientProfile,
    adminLogin,
    adminLogout,
    registerDoctor,
    updateDoctor,
    setDoctorActive,
    addSchedules,
    deleteSchedule,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    completeAppointment,
    addMessage,
    markMessageRead,
    markAllMessagesRead,
    deleteMessage,
  }

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic(): ClinicContextValue {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinic debe usarse dentro de ClinicProvider')
  }
  return context
}
