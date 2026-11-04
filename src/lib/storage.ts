import type { ClinicData, Session } from '../types'
import { createSeedData } from './seed'

const DATA_KEY = 'posta-ascarrunz:data:v1'
const SESSION_KEY = 'posta-ascarrunz:session:v1'

const defaultSession: Session = { patientId: null, admin: false }

function isClinicData(value: unknown): value is ClinicData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<ClinicData>
  return (
    data.version === 1 &&
    Array.isArray(data.patients) &&
    Array.isArray(data.doctors) &&
    Array.isArray(data.schedules) &&
    Array.isArray(data.appointments) &&
    Array.isArray(data.messages)
  )
}

export function loadData(): ClinicData {
  if (typeof window === 'undefined') return createSeedData()
  try {
    const raw = window.localStorage.getItem(DATA_KEY)
    if (!raw) {
      const seed = createSeedData()
      window.localStorage.setItem(DATA_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed: unknown = JSON.parse(raw)
    if (isClinicData(parsed)) return parsed
  } catch {
    // Datos corruptos: se regenera la demo para no bloquear la app.
  }
  const seed = createSeedData()
  window.localStorage.setItem(DATA_KEY, JSON.stringify(seed))
  return seed
}

export function saveData(data: ClinicData): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export function loadSession(): Session {
  if (typeof window === 'undefined') return defaultSession
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return defaultSession
    const parsed = JSON.parse(raw) as Partial<Session>
    return {
      patientId: typeof parsed.patientId === 'string' ? parsed.patientId : null,
      admin: parsed.admin === true,
    }
  } catch {
    return defaultSession
  }
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(DATA_KEY)
  window.localStorage.removeItem(SESSION_KEY)
}
