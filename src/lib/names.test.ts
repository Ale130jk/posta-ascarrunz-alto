import { describe, expect, it } from 'vitest'
import {
  appointmentCode,
  doctorFullName,
  initials,
  patientFullName,
} from './names'
import type { Doctor } from '../types'

const doctor: Doctor = {
  id: 'doc_1',
  prefix: 'Dra.',
  firstName: 'Rosa',
  lastNamePaternal: 'Quispe',
  lastNameMaternal: 'Huamán',
  specialty: 'Medicina General',
  email: 'rosa@postaascarrunz.pe',
  phone: '987110201',
  license: 'CMP 045612',
  bio: '',
  color: 'teal',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('names', () => {
  it('arma el nombre completo del paciente sin espacios vacíos', () => {
    expect(
      patientFullName({
        firstName: 'María',
        lastNamePaternal: 'Fernández',
        lastNameMaternal: '',
      }),
    ).toBe('María Fernández')
  })

  it('arma el nombre completo del doctor con su tratamiento', () => {
    expect(doctorFullName(doctor)).toBe('Dra. Rosa Quispe Huamán')
  })

  it('genera iniciales y códigos de cita', () => {
    expect(initials('María', 'Fernández')).toBe('MF')
    expect(initials('María Fernanda')).toBe('MF')
    expect(appointmentCode('apt_12ab34cd56ef')).toBe('CD56EF')
  })
})
