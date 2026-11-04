import type {
  Appointment,
  ClinicData,
  ContactMessage,
  Doctor,
  Patient,
  ScheduleBlock,
  Weekday,
} from '../types'
import { getAvailableSlots } from './availability'
import { addDaysISO, todayISO } from './dates'
import { createId } from './id'

const now = new Date().toISOString()

function scheduleBlocks(
  doctorId: string,
  weekdays: Weekday[],
  start: string,
  end: string,
): ScheduleBlock[] {
  return weekdays.map((weekday) => ({
    id: createId('sch'),
    doctorId,
    weekday,
    start,
    end,
  }))
}

const doctors: Doctor[] = [
  {
    id: 'doc_rosa',
    prefix: 'Dra.',
    firstName: 'Rosa',
    lastNamePaternal: 'Quispe',
    lastNameMaternal: 'Huamán',
    specialty: 'Medicina General',
    email: 'rquispe@postaascarrunz.pe',
    phone: '987110201',
    license: 'CMP 045612',
    bio: 'Medicina familiar, control de enfermedades crónicas y prevención.',
    color: 'rose',
    active: true,
    createdAt: now,
  },
  {
    id: 'doc_carlos',
    prefix: 'Dr.',
    firstName: 'Carlos',
    lastNamePaternal: 'Mendoza',
    lastNameMaternal: 'Ríos',
    specialty: 'Pediatría',
    email: 'cmendoza@postaascarrunz.pe',
    phone: '987110202',
    license: 'CMP 061238',
    bio: 'Seguimiento del crecimiento y desarrollo infantil.',
    color: 'sky',
    active: true,
    createdAt: now,
  },
  {
    id: 'doc_lucia',
    prefix: 'Dra.',
    firstName: 'Lucía',
    lastNamePaternal: 'Torres',
    lastNameMaternal: 'Salazar',
    specialty: 'Obstetricia',
    email: 'ltorres@postaascarrunz.pe',
    phone: '987110203',
    license: 'COP 028941',
    bio: 'Acompañamiento prenatal y salud de la mujer.',
    color: 'amber',
    active: true,
    createdAt: now,
  },
  {
    id: 'doc_jorge',
    prefix: 'Dr.',
    firstName: 'Jorge',
    lastNamePaternal: 'Ramírez',
    lastNameMaternal: 'Paredes',
    specialty: 'Odontología',
    email: 'jramirez@postaascarrunz.pe',
    phone: '987110204',
    license: 'CD 039874',
    bio: 'Odontología preventiva, limpieza y restauración.',
    color: 'emerald',
    active: true,
    createdAt: now,
  },
]

const schedules: ScheduleBlock[] = [
  ...scheduleBlocks('doc_rosa', [1, 2, 3, 4, 5], '09:00', '13:00'),
  ...scheduleBlocks('doc_rosa', [1, 2, 3, 4, 5], '14:00', '17:30'),
  ...scheduleBlocks('doc_rosa', [6], '09:00', '12:30'),
  ...scheduleBlocks('doc_carlos', [1, 3, 5], '09:00', '13:00'),
  ...scheduleBlocks('doc_carlos', [2, 4], '14:00', '18:00'),
  ...scheduleBlocks('doc_carlos', [6], '09:00', '13:00'),
  ...scheduleBlocks('doc_lucia', [1, 2, 3, 4, 5], '10:00', '14:00'),
  ...scheduleBlocks('doc_lucia', [6], '09:00', '12:00'),
  ...scheduleBlocks('doc_jorge', [1, 2, 3, 4, 5], '09:00', '13:00'),
  ...scheduleBlocks('doc_jorge', [1, 2, 3, 4, 5], '15:00', '18:00'),
  ...scheduleBlocks('doc_jorge', [6], '09:00', '13:00'),
]

const patients: Patient[] = [
  {
    id: 'pat_maria',
    email: 'maria.fernandez@example.com',
    dni: '45678912',
    firstName: 'María Fernanda',
    lastNamePaternal: 'Fernández',
    lastNameMaternal: 'Rojas',
    phone: '987123456',
    createdAt: now,
  },
  {
    id: 'pat_diego',
    email: 'diego.salazar@example.com',
    dni: '71234567',
    firstName: 'Diego',
    lastNamePaternal: 'Salazar',
    lastNameMaternal: 'Campos',
    phone: '987234567',
    createdAt: now,
  },
  {
    id: 'pat_ana',
    email: 'ana.paredes@example.com',
    dni: '70123456',
    firstName: 'Ana Lucía',
    lastNamePaternal: 'Paredes',
    lastNameMaternal: 'Vega',
    phone: '987345678',
    createdAt: now,
  },
  {
    id: 'pat_mateo',
    email: 'mateo.salazar@example.com',
    dni: '76543210',
    firstName: 'Mateo',
    lastNamePaternal: 'Salazar',
    lastNameMaternal: 'Fernández',
    phone: '987456789',
    createdAt: now,
  },
]

const appointments: Appointment[] = []

function seedAppointment(
  patientId: string,
  doctorId: string,
  fromOffset: number,
  preferredStart: string,
  reason: string,
): void {
  for (let offset = fromOffset; offset <= fromOffset + 20; offset += 1) {
    const date = addDaysISO(todayISO(), offset)
    const slots = getAvailableSlots({
      schedules,
      appointments,
      doctorId,
      dateISO: date,
    })
    const slot =
      slots.find((item) => item.start >= preferredStart) ?? slots[0] ?? null
    if (!slot) continue

    appointments.push({
      id: createId('apt'),
      patientId,
      doctorId,
      date,
      start: slot.start,
      end: slot.end,
      reason,
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    })
    return
  }
}

seedAppointment(
  'pat_maria',
  'doc_rosa',
  1,
  '10:00',
  'Control de presión arterial',
)
seedAppointment('pat_diego', 'doc_jorge', 1, '09:30', 'Limpieza dental')
seedAppointment('pat_ana', 'doc_lucia', 2, '10:30', 'Control prenatal')
seedAppointment('pat_mateo', 'doc_carlos', 2, '09:00', 'Control de niño sano')

const messages: ContactMessage[] = [
  {
    id: createId('msg'),
    name: 'Carmen Rojas',
    email: 'carmen.rojas@example.com',
    phone: '986555111',
    message:
      'Buenas tardes, quisiera saber si atienden los sábados y si debo llevar algún documento adicional.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read: false,
  },
  {
    id: createId('msg'),
    name: 'Luis Medina',
    email: 'luis.medina@example.com',
    phone: '',
    message:
      'Gracias por la atención de la semana pasada. ¿Podrían confirmarme el horario de odontología?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    read: true,
  },
]

export function createSeedData(): ClinicData {
  return {
    version: 1,
    patients,
    doctors,
    schedules,
    appointments,
    messages,
  }
}
