export const GITHUB_REPO = 'https://github.com/Ale130jk/posta-ascarrunz-alto'
export const GITHUB_PROFILE = 'https://github.com/Ale130jk'

export const TECH_METRICS = {
  measuredAt: '3 de noviembre de 2026',
  tests: {
    files: 5,
    total: 42,
    passed: 42,
    statements: 81.35,
    branches: 75.62,
    functions: 80.28,
    lines: 84.03,
  },
  lazyPages: 10,
  routes: 14,
  horizonDays: 60,
  appointmentMinutes: 30,
  chunks: [
    { file: 'index-*.js', role: 'Aplicación, router y contexto', gzip: '111.7 kB' },
    { file: 'calendar-*.js', role: 'FullCalendar y tema Forma', gzip: '81.7 kB' },
    { file: 'TechPage-*.js', role: 'Dossier técnico', gzip: '11.6 kB' },
  ],
}

export const STACK = [
  'React 19',
  'TypeScript',
  'Vite 8',
  'Tailwind CSS 4',
  'React Router 7',
  'FullCalendar 7',
  'Vitest 5',
]

export const STACK_ROWS = [
  { label: 'Arquitectura', value: 'SPA con rutas por rol' },
  { label: 'Estado', value: 'Context API + estado local' },
  { label: 'Datos', value: 'localStorage versionado' },
  { label: 'Agenda', value: 'FullCalendar 7, tema Forma' },
  { label: 'Pruebas', value: '42 casos con Vitest' },
  { label: 'Backend', value: 'No incluido (demo frontend)' },
]

export type EvaluationTone = 'strong' | 'measured' | 'improve' | 'demo'

export const EVALUATION = [
  {
    dimension: 'Mantenibilidad',
    status: 'Fuerte',
    tone: 'strong' as EvaluationTone,
    evidence:
      'Lógica de agenda en funciones puras, tipos compartidos y pruebas sobre las reglas críticas.',
    link: 'src/lib/availability.ts',
  },
  {
    dimension: 'Confiabilidad de agenda',
    status: 'Fuerte',
    tone: 'strong' as EvaluationTone,
    evidence:
      'Sin cruces de médico o paciente, cupos de 30 minutos, horizonte de 60 días y aviso de 24 horas.',
    link: 'src/lib/availability.ts',
  },
  {
    dimension: 'Rendimiento',
    status: 'Medido',
    tone: 'measured' as EvaluationTone,
    evidence:
      'Rutas diferidas, FullCalendar en un chunk aparte y métricas de la visita calculadas en vivo.',
    link: 'src/App.tsx',
  },
  {
    dimension: 'Accesibilidad',
    status: 'En mejora',
    tone: 'improve' as EvaluationTone,
    evidence:
      'Foco visible, formularios etiquetados, diálogos con foco gestionado y reduced motion. Falta auditoría con lector de pantalla.',
    link: 'src/index.css',
  },
  {
    dimension: 'Seguridad',
    status: 'Demo',
    tone: 'demo' as EvaluationTone,
    evidence:
      'Validación de entrada y guards de sesión. La autenticación es simulada y no hay backend; no es un sistema clínico real.',
    link: 'README.md',
  },
]

export const DECISIONS = [
  {
    number: '01',
    title: 'La agenda no vive dentro de React',
    problem:
      'Calcular cupos, cruces y reprogramaciones dentro de componentes vuelve las reglas difíciles de probar.',
    decision:
      'getAvailableSlots recibe horarios, citas y fecha; devuelve cupos. No conoce componentes ni estado global.',
    tradeoff:
      'Cada llamada recibe los datos actuales. Es explícito, pero exige disciplina en el llamador.',
    file: 'src/lib/availability.ts',
    tag: 'Funciones puras',
  },
  {
    number: '02',
    title: 'Un contexto, acciones con nombre',
    problem:
      'Varias pantallas mutan médicos, horarios y citas; dispersar la escritura duplica validaciones.',
    decision:
      'ClinicContext expone acciones como bookAppointment o addSchedules. Cada acción valida y persiste una sola vez.',
    tradeoff:
      'El provider concentra responsabilidad y re-renderiza consumidores. Para este tamaño es un costo aceptable.',
    file: 'src/context/ClinicContext.tsx',
    tag: 'Estado',
  },
  {
    number: '03',
    title: 'Persistencia tolerante a fallos',
    problem:
      'Una demo con localStorage puede encontrar datos viejos, incompletos o corruptos.',
    decision:
      'loadData verifica versión y colecciones. Si algo no cuadra, regenera el seed en lugar de romper la app.',
    tradeoff:
      'Los datos viven por navegador. No hay sincronización entre dispositivos ni respaldo remoto.',
    file: 'src/lib/storage.ts',
    tag: 'Datos',
  },
  {
    number: '04',
    title: 'Rutas por rol y carga diferida',
    problem:
      'Un calendario completo en la carga inicial castiga a quien solo quiere ver la página pública.',
    decision:
      'Las páginas de paciente y admin usan React.lazy. FullCalendar queda en un chunk separado.',
    tradeoff:
      'La primera navegación a una ruta diferida muestra un fallback de carga.',
    file: 'src/App.tsx',
    tag: 'Rendimiento',
  },
  {
    number: '05',
    title: 'Validar antes de mutar',
    problem:
      'Los formularios no son la única entrada: el contexto también recibe datos de la UI.',
    decision:
      'Los validadores viven en lib y se reutilizan en formularios y acciones. Los guards de sesión se aplican en la acción.',
    tradeoff:
      'Hay verificaciones deliberadamente repetidas entre UI y dominio.',
    file: 'src/lib/validation.ts',
    tag: 'Contratos',
  },
  {
    number: '06',
    title: 'Fechas como reglas explícitas',
    problem:
      'Comparar strings de fecha y hora es fácil de leer, pero también fácil de romper en los bordes.',
    decision:
      'El proyecto centraliza suma de días, minutos, horario de 12 horas y la regla de cancelación de 24 horas.',
    tradeoff:
      'Se asume la zona local del navegador; no hay backend que fije America/Lima para todos.',
    file: 'src/lib/dates.ts',
    tag: 'Tiempo',
  },
]

export type RouteLoad = 'eager' | 'lazy'

export const ROUTE_GROUPS = [
  {
    role: 'Público',
    description: 'Landing, acceso y dossier técnico.',
    routes: [
      { path: '/', label: 'Inicio', load: 'eager' as RouteLoad },
      { path: '/login', label: 'Acceso paciente', load: 'eager' as RouteLoad },
      { path: '/tech', label: 'Dossier técnico', load: 'lazy' as RouteLoad },
    ],
  },
  {
    role: 'Paciente',
    description: 'Reservas, historial y perfil.',
    routes: [
      { path: '/mi-cuenta', label: 'Resumen', load: 'lazy' as RouteLoad },
      { path: '/mi-cuenta/reservar', label: 'Reservar cita', load: 'lazy' as RouteLoad },
      { path: '/mi-cuenta/citas', label: 'Mis citas', load: 'lazy' as RouteLoad },
      { path: '/mi-cuenta/perfil', label: 'Mis datos', load: 'lazy' as RouteLoad },
    ],
  },
  {
    role: 'Administración',
    description: 'Agenda, médicos, citas y mensajes.',
    routes: [
      { path: '/admin/login', label: 'Acceso admin', load: 'eager' as RouteLoad },
      { path: '/admin', label: 'Panel', load: 'lazy' as RouteLoad },
      { path: '/admin/doctores', label: 'Doctores', load: 'lazy' as RouteLoad },
      { path: '/admin/horarios', label: 'Horarios', load: 'lazy' as RouteLoad },
      { path: '/admin/citas', label: 'Citas', load: 'lazy' as RouteLoad },
      { path: '/admin/mensajes', label: 'Mensajes', load: 'lazy' as RouteLoad },
    ],
  },
]

export const TEST_FILES = [
  {
    file: 'availability.test.ts',
    area: 'Agenda',
    covers:
      'Cupos de 30 minutos, cruces de médico, citas canceladas, reprogramación, horizonte y resúmenes de horario.',
  },
  {
    file: 'dates.test.ts',
    area: 'Tiempo',
    covers:
      'Conversión de horas, cambios de mes, horario de 12 horas, cancelación de 24 horas y orden de citas.',
  },
  {
    file: 'validation.test.ts',
    area: 'Contratos',
    covers:
      'DNI de 8 dígitos, celular de 9, nombres, correo, especialidades, licencias y mensajes de contacto.',
  },
  {
    file: 'storage.test.ts',
    area: 'Datos',
    covers:
      'Seed inicial, guardado, datos corruptos, sesión inválida y reinicio de la demo.',
  },
  {
    file: 'names.test.ts',
    area: 'Presentación',
    covers:
      'Nombres completos, iniciales y códigos cortos de cita.',
  },
]

export const ACCESSIBILITY = [
  {
    title: 'Foco visible y navegación por teclado',
    detail:
      'Anillo de foco global, botones nativos y un enlace para saltar al contenido principal.',
  },
  {
    title: 'Formularios con contexto',
    detail:
      'Cada control tiene label, aria-invalid y mensajes de error con role="alert".',
  },
  {
    title: 'Diálogos predecibles',
    detail:
      'role="dialog", aria-modal, cierre con Escape, foco inicial y retorno al elemento anterior.',
  },
  {
    title: 'Movimiento respetado',
    detail:
      'Las animaciones se desactivan con prefers-reduced-motion y el scroll suave se vuelve instantáneo.',
  },
]

export const PERFORMANCE_NOTES = [
  {
    title: 'Rutas que esperan su turno',
    detail:
      '10 páginas se cargan con React.lazy. La landing no descarga el panel administrativo.',
  },
  {
    title: 'El calendario pesa donde debe',
    detail:
      'FullCalendar y el tema Forma quedan en un chunk separado; solo se descargan al abrir una agenda.',
  },
  {
    title: 'Medición en el navegador',
    detail:
      'TTFB, FCP, LCP, CLS, recursos y peso transferido se leen con Performance API en esta visita.',
  },
]

export const KEY_FUNCTIONS = [
  {
    name: 'getAvailableSlots',
    file: 'src/lib/availability.ts',
    summary:
      'Genera cupos desde los bloques del doctor, descarta horas pasadas, cruces y duplicados.',
    detail: 'Complejidad O(bloques × cupos + citas).',
  },
  {
    name: 'getNextAvailableSlot',
    file: 'src/lib/availability.ts',
    summary:
      'Recorre hasta 61 días para alimentar el “próximo cupo” de la página pública.',
    detail: 'Una sola fuente para la landing y la ficha del médico.',
  },
  {
    name: 'addSchedules',
    file: 'src/context/ClinicContext.tsx',
    summary:
      'Valida día permitido, horas de atención, bloques de 30 minutos y cruces antes de guardar.',
    detail: 'Rechaza domingos y horarios fuera de 09:00–18:00.',
  },
  {
    name: 'patientHasOverlap',
    file: 'src/lib/availability.ts',
    summary:
      'Impide que un paciente reserve dos citas que se crucen, incluso con distintos médicos.',
    detail: 'Ignora citas canceladas y la cita que se está reprogramando.',
  },
  {
    name: 'loadData',
    file: 'src/lib/storage.ts',
    summary:
      'Lee el estado persistido, valida su forma y regenera el seed si está corrupto.',
    detail: 'La demo no se queda en blanco por un JSON inválido.',
  },
]
