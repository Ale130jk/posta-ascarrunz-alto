import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadData,
  loadSession,
  resetDemoData,
  saveData,
  saveSession,
} from './storage'

const DATA_KEY = 'posta-ascarrunz:data:v1'
const SESSION_KEY = 'posta-ascarrunz:session:v1'

const store = new Map<string, string>()

const localStorageStub = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value)
  },
  removeItem: (key: string) => {
    store.delete(key)
  },
}

describe('storage', () => {
  beforeEach(() => {
    store.clear()
    vi.stubGlobal('window', { localStorage: localStorageStub })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('genera y persiste el seed la primera vez', () => {
    const data = loadData()

    expect(data.version).toBe(1)
    expect(data.doctors).toHaveLength(4)
    expect(data.appointments.length).toBeGreaterThan(0)
    expect(JSON.parse(store.get(DATA_KEY) ?? '{}')).toMatchObject({ version: 1 })
  })

  it('lee datos válidos previamente guardados', () => {
    const data = loadData()
    const changed = {
      ...data,
      doctors: data.doctors.map((doctor, index) =>
        index === 0 ? { ...doctor, bio: 'Texto actualizado' } : doctor,
      ),
    }

    saveData(changed)

    expect(loadData().doctors[0].bio).toBe('Texto actualizado')
  })

  it('regenera la demo si los datos están corruptos', () => {
    store.set(DATA_KEY, '{no es json')

    const data = loadData()

    expect(data.doctors).toHaveLength(4)
    expect(store.get(DATA_KEY)).not.toBe('{no es json')
  })

  it('guarda y recupera la sesión, con valores por defecto ante errores', () => {
    expect(loadSession()).toEqual({ patientId: null, admin: false })

    saveSession({ patientId: 'pat_maria', admin: true })
    expect(loadSession()).toEqual({ patientId: 'pat_maria', admin: true })

    store.set(SESSION_KEY, JSON.stringify({ patientId: 123, admin: 'sí' }))
    expect(loadSession()).toEqual({ patientId: null, admin: false })
  })

  it('elimina datos y sesión al reiniciar la demo', () => {
    loadData()
    saveSession({ patientId: 'pat_maria', admin: false })

    resetDemoData()

    expect(store.has(DATA_KEY)).toBe(false)
    expect(store.has(SESSION_KEY)).toBe(false)
  })
})
