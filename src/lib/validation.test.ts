import { describe, expect, it } from 'vitest'
import type { ContactInput, DoctorInput, PatientProfileInput } from '../types'
import {
  isProfileComplete,
  isValidDni,
  isValidEmail,
  isValidName,
  isValidPhone,
  normalizeName,
  validateContactInput,
  validateDoctorInput,
  validatePatientProfile,
  validateReason,
} from './validation'

const validProfile: PatientProfileInput = {
  firstName: 'María Fernanda',
  lastNamePaternal: 'Fernández',
  lastNameMaternal: 'Rojas',
  dni: '45678912',
  phone: '987123456',
}

const validDoctor: DoctorInput = {
  prefix: 'Dra.',
  firstName: 'Rosa',
  lastNamePaternal: 'Quispe',
  lastNameMaternal: 'Huamán',
  specialty: 'Medicina General',
  email: 'rosa@postaascarrunz.pe',
  phone: '987110201',
  license: 'CMP 045612',
  bio: 'Medicina familiar.',
  color: 'teal',
}

const validContact: ContactInput = {
  name: 'Carmen Rojas',
  email: 'carmen@example.com',
  phone: '986555111',
  message: 'Quisiera saber si atienden los sábados por la mañana.',
}

describe('validaciones básicas', () => {
  it('normaliza espacios y valida nombres', () => {
    expect(normalizeName('  María   Fernanda  ')).toBe('María Fernanda')
    expect(isValidName('María Fernanda')).toBe(true)
    expect(isValidName('José Luis')).toBe(true)
    expect(isValidName('Ana2')).toBe(false)
    expect(isValidName('A')).toBe(false)
  })

  it('valida correo, DNI y celular', () => {
    expect(isValidEmail('persona@example.com')).toBe(true)
    expect(isValidEmail('persona@example')).toBe(false)
    expect(isValidDni('45678912')).toBe(true)
    expect(isValidDni('4567891')).toBe(false)
    expect(isValidDni('4567891a')).toBe(false)
    expect(isValidPhone('987123456')).toBe(true)
    expect(isValidPhone('98712345')).toBe(false)
  })
})

describe('validatePatientProfile', () => {
  it('acepta un perfil completo', () => {
    expect(validatePatientProfile(validProfile)).toEqual({})
  })

  it('rechaza DNI, celular y nombres inválidos', () => {
    const errors = validatePatientProfile({
      ...validProfile,
      firstName: 'María2',
      dni: '123',
      phone: '987',
    })

    expect(Object.keys(errors).sort()).toEqual(['dni', 'firstName', 'phone'])
  })

  it('considera completo solo un perfil con correo y datos válidos', () => {
    expect(
      isProfileComplete({
        id: 'pat_1',
        email: 'maria@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        ...validProfile,
      }),
    ).toBe(true)
    expect(
      isProfileComplete({
        id: 'pat_1',
        email: 'maria@example.com',
        dni: '',
        firstName: '',
        lastNamePaternal: '',
        lastNameMaternal: '',
        phone: '',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe(false)
  })
})

describe('validateDoctorInput', () => {
  it('acepta un doctor válido', () => {
    expect(validateDoctorInput(validDoctor)).toEqual({})
  })

  it('rechaza especialidad, color, correo y licencia inválidos', () => {
    const errors = validateDoctorInput({
      ...validDoctor,
      specialty: 'Astrofísica',
      color: 'magenta' as DoctorInput['color'],
      email: 'correo',
      license: 'x',
      bio: 'a'.repeat(241),
    })

    expect(Object.keys(errors).sort()).toEqual([
      'bio',
      'color',
      'email',
      'license',
      'specialty',
    ])
  })
})

describe('validateContactInput', () => {
  it('acepta un mensaje válido', () => {
    expect(validateContactInput(validContact)).toEqual({})
  })

  it('rechaza mensajes cortos y teléfonos incompletos', () => {
    const errors = validateContactInput({
      ...validContact,
      phone: '986',
      message: 'Hola',
    })

    expect(Object.keys(errors).sort()).toEqual(['message', 'phone'])
  })
})

describe('validateReason', () => {
  it('permite motivo vacío y valida longitudes', () => {
    expect(validateReason('')).toBeNull()
    expect(validateReason('abc')).toContain('al menos 4')
    expect(validateReason('Control anual')).toBeNull()
    expect(validateReason('a'.repeat(201))).toContain('200')
  })
})
