import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  GitBranch,
  LockKeyhole,
  Route as RouteIcon,
  ShieldCheck,
  TestTube2,
} from 'lucide-react'
import { SectionHeading } from '../../components/ui/Page'
import { Pill } from '../../components/ui/Badge'
import { buttonStyles } from '../../components/ui/Button'
import { RuntimeMetrics } from '../../components/tech/RuntimeMetrics'
import {
  ACCESSIBILITY,
  DECISIONS,
  EVALUATION,
  GITHUB_PROFILE,
  GITHUB_REPO,
  KEY_FUNCTIONS,
  PERFORMANCE_NOTES,
  ROUTE_GROUPS,
  STACK,
  STACK_ROWS,
  TECH_METRICS,
  TEST_FILES,
} from '../../data/techContent'

const sectionLinks = [
  { href: '#evaluacion', label: 'Evaluación' },
  { href: '#arquitectura', label: 'Arquitectura' },
  { href: '#decisiones', label: 'Decisiones' },
  { href: '#calidad', label: 'Calidad' },
  { href: '#rendimiento', label: 'Rendimiento' },
  { href: '#funciones', label: 'Funciones' },
]

const evaluationTones = {
  strong: 'green',
  measured: 'sky',
  improve: 'amber',
  demo: 'neutral',
} as const

function GitHubFileLink({
  path,
  children,
  className = '',
}: {
  path: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={`${GITHUB_REPO}/blob/main/${path}`}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 text-xs font-bold text-brand-700 transition hover:text-brand-900 ${className}`}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only"> (abre en una pestaña nueva)</span>
    </a>
  )
}

export function TechPage() {
  return (
    <div>
      <section
        aria-labelledby="tech-title"
        className="relative overflow-hidden bg-brand-950 text-white"
      >
        <div className="tech-grid absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden="true" />
                Dossier técnico · Proyecto de portafolio
              </p>
              <h1
                id="tech-title"
                className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance sm:text-6xl"
              >
                La ingeniería detrás de cada cita.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
                Un recorrido por la arquitectura, las reglas de agenda, las
                pruebas y el rendimiento de la Posta Médica Ascarrunz Alto. Sin
                humo: lo que está implementado, lo que se mide y lo que todavía
                falta.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: 'inverse', size: 'lg' })}
                >
                  <GithubMark />
                  Ver código en GitHub
                  <span className="sr-only"> (abre en una pestaña nueva)</span>
                </a>
                <Link
                  to="/"
                  className={buttonStyles({
                    variant: 'inverse',
                    size: 'lg',
                    className: 'border-white/10 text-white/70',
                  })}
                >
                  Volver a la demo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-9 flex flex-wrap gap-2" aria-label="Tecnologías principales">
                {STACK.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/60"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-brand-950/30 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">
                  Ficha del sistema
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/30 bg-brand-300/10 px-2.5 py-1 text-[10px] font-bold text-brand-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-300" aria-hidden="true" />
                  Demo frontend
                </span>
              </div>
              <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {STACK_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 py-2.5"
                  >
                    <dt className="text-[11px] font-semibold text-white/40">{row.label}</dt>
                    <dd className="text-right text-xs font-semibold text-white/80">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-white/40">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Sin API ni base de datos. Los datos viven en el navegador y la
                autenticación es demostrativa.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section
        aria-label="Métricas del proyecto"
        className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 sm:px-6 lg:px-8"
      >
        <dl className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-ink/[0.04] sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: `${TECH_METRICS.tests.total}`,
              label: 'pruebas automatizadas',
              hint: `${TECH_METRICS.tests.files} archivos · Vitest`,
            },
            {
              value: `${TECH_METRICS.tests.lines}%`,
              label: 'cobertura de líneas',
              hint: 'lógica de negocio',
            },
            {
              value: `${TECH_METRICS.lazyPages}`,
              label: 'páginas diferidas',
              hint: 'React.lazy por rol',
            },
            {
              value: `${TECH_METRICS.horizonDays} días`,
              label: 'de horizonte de reserva',
              hint: 'con reglas de 24 horas',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-line p-5 odd:border-b sm:odd:border-b-0 sm:[&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0 lg:[&:not(:last-child)]:border-r sm:[&:nth-child(odd)]:border-r"
            >
              <dt className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/40">
                {item.label}
              </dt>
              <dd className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-ink">
                {item.value}
              </dd>
              <dd className="mt-1 text-[11px] text-ink/45">{item.hint}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav
        aria-label="Secciones del dossier"
        className="mx-auto mt-10 flex max-w-7xl gap-1 overflow-x-auto px-5 pb-1 no-scrollbar sm:px-6 lg:px-8"
      >
        {sectionLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-line bg-white px-3.5 py-2 text-[11px] font-bold text-ink/55 transition hover:border-brand-200 hover:text-brand-800"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section
        id="evaluacion"
        aria-labelledby="evaluacion-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Lectura para reclutadores"
              title={
                <span id="evaluacion-title">
                  Qué puedes evaluar, sin abrir el código.
                </span>
              }
              description="Cinco dimensiones con evidencia concreta. Los estados son deliberados: no todo está terminado y el alcance de demo está declarado."
            />
            <div className="mt-8 rounded-2xl border border-line bg-sand/60 p-5">
              <p className="flex items-start gap-2 text-xs leading-6 text-ink/55">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
                Proyecto de portafolio centrado en producto y frontend. No usa
                datos reales de pacientes ni debe operar una posta sin backend,
                auditoría y controles de acceso.
              </p>
            </div>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {EVALUATION.map((item) => (
              <article
                key={item.dimension}
                className="grid gap-3 py-5 sm:grid-cols-[10rem_6.5rem_1fr] sm:items-start sm:gap-5"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                  {item.dimension}
                </h3>
                <Pill tone={evaluationTones[item.tone]}>{item.status}</Pill>
                <div>
                  <p className="text-sm leading-6 text-ink/60">{item.evidence}</p>
                  <GitHubFileLink path={item.link} className="mt-2">
                    Ver evidencia
                  </GitHubFileLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="arquitectura"
        aria-labelledby="arquitectura-title"
        className="scroll-mt-24 border-y border-line bg-sand/50"
      >
        <div className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Arquitectura"
                title={
                  <span id="arquitectura-title">
                    Capas pequeñas, responsabilidades claras.
                  </span>
                }
                description="La interfaz no calcula reglas de agenda. El contexto orquesta; la lógica pura decide; el adaptador persiste."
              />

              <ol className="mt-9 flex flex-wrap items-center gap-2 text-[11px] font-bold text-ink/55" aria-label="Capas de la aplicación">
                {['UI', 'Rutas', 'Contexto', 'Lógica pura', 'Storage'].map(
                  (layer, index) => (
                    <li key={layer} className="flex items-center gap-2">
                      <span className="rounded-full border border-line bg-white px-3 py-1.5">
                        {layer}
                      </span>
                      {index < 4 && (
                        <ArrowRight className="h-3.5 w-3.5 text-ink/25" aria-hidden="true" />
                      )}
                    </li>
                  ),
                )}
              </ol>

              <div className="mt-8 space-y-5 text-sm leading-7 text-ink/60">
                <p>
                  <span className="font-bold text-ink">UI:</span> páginas por rol,
                  componentes reutilizables y Tailwind con tokens de marca.
                </p>
                <p>
                  <span className="font-bold text-ink">Dominio:</span> disponibilidad,
                  fechas y validación viven en funciones sin dependencias de React.
                </p>
                <p>
                  <span className="font-bold text-ink">Estado:</span> un solo
                  ClinicContext expone acciones con nombre y guards de sesión.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <GitHubFileLink path="src/App.tsx">Rutas y lazy loading</GitHubFileLink>
                <GitHubFileLink path="src/context/ClinicContext.tsx">
                  Acciones de negocio
                </GitHubFileLink>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink/40">
                  Flujo de una reserva
                </p>
                <RouteIcon className="h-4 w-4 text-brand-600" aria-hidden="true" />
              </div>
              <ol className="mt-5 space-y-0">
                {[
                  {
                    title: 'La persona elige fecha y hora',
                    detail: 'BookAppointmentPage consulta los cupos del médico.',
                    file: 'BookAppointmentPage.tsx',
                  },
                  {
                    title: 'La lógica descarta lo inválido',
                    detail: 'Horas pasadas, bloques ocupados y cruces del paciente.',
                    file: 'availability.ts',
                  },
                  {
                    title: 'La acción vuelve a validar',
                    detail: 'Perfil completo, horizonte, médico activo y cupo vigente.',
                    file: 'ClinicContext.tsx',
                  },
                  {
                    title: 'El estado se confirma y persiste',
                    detail: 'commitData actualiza la UI y guarda el snapshot en localStorage.',
                    file: 'storage.ts',
                  },
                ].map((step, index) => (
                  <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brand-200 bg-brand-50 text-[11px] font-extrabold text-brand-800">
                        {index + 1}
                      </span>
                      {index < 3 && (
                        <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-sm font-bold text-ink">{step.title}</p>
                      <p className="mt-1 text-xs leading-5 text-ink/55">
                        {step.detail}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] text-brand-700/70">
                        {step.file}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink/40">
                  Mapa de rutas
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                  Tres audiencias, una sola aplicación.
                </h3>
              </div>
              <p className="text-xs text-ink/45">
                {TECH_METRICS.routes} rutas · {TECH_METRICS.lazyPages} con carga diferida
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {ROUTE_GROUPS.map((group) => (
                <article
                  key={group.role}
                  className="rounded-2xl border border-line bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-display text-lg font-semibold text-ink">
                      {group.role}
                    </h4>
                    <Pill tone="neutral">{group.routes.length} rutas</Pill>
                  </div>
                  <p className="mt-1 text-[11px] text-ink/45">{group.description}</p>
                  <ul className="mt-4 space-y-2">
                    {group.routes.map((route) => (
                      <li
                        key={route.path}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-paper px-3 py-2"
                      >
                        <span className="font-mono text-[10px] text-ink/55">
                          {route.path}
                        </span>
                        <span
                          className={
                            route.load === 'lazy'
                              ? 'shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand-700'
                              : 'shrink-0 rounded-full bg-sand px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink/45'
                          }
                        >
                          {route.load === 'lazy' ? 'lazy' : 'eager'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="decisiones"
        aria-labelledby="decisiones-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <SectionHeading
          eyebrow="Decisiones de ingeniería"
          title={
            <span id="decisiones-title">
              Seis decisiones que sostienen el producto.
            </span>
          }
          description="Cada tarjeta declara el problema, la decisión tomada y el costo que acepta. Es la parte que más dice de cómo se trabaja."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DECISIONS.map((decision) => (
            <article
              key={decision.number}
              className="flex flex-col rounded-2xl border border-line bg-white p-5 transition hover:border-brand-200 hover:shadow-md hover:shadow-ink/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[11px] font-bold text-brand-700/60">
                  {decision.number}
                </span>
                <Pill tone="brand">{decision.tag}</Pill>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-tight text-ink">
                {decision.title}
              </h3>
              <dl className="mt-4 flex-1 space-y-3 text-xs leading-5">
                <div>
                  <dt className="font-bold uppercase tracking-[0.1em] text-ink/35">
                    Problema
                  </dt>
                  <dd className="mt-1 text-ink/55">{decision.problem}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-[0.1em] text-ink/35">
                    Decisión
                  </dt>
                  <dd className="mt-1 text-ink/65">{decision.decision}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-[0.1em] text-ink/35">
                    Costo aceptado
                  </dt>
                  <dd className="mt-1 text-ink/50">{decision.tradeoff}</dd>
                </div>
              </dl>
              <GitHubFileLink path={decision.file} className="mt-4">
                Ver archivo
              </GitHubFileLink>
            </article>
          ))}
        </div>
      </section>

      <section
        id="calidad"
        aria-labelledby="calidad-title"
        className="scroll-mt-24 border-y border-line bg-brand-950 text-white"
      >
        <div className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Calidad verificable"
                title={
                  <span id="calidad-title">
                    42 pruebas, una regla por caso.
                  </span>
                }
                description="La suite se concentra en la lógica que puede romper una cita: cupos, cruces, fechas, validación y persistencia."
                light
              />

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/40">
                      Cobertura de líneas
                    </p>
                    <p className="mt-1 font-display text-4xl font-semibold">
                      {TECH_METRICS.tests.lines}%
                    </p>
                  </div>
                  <TestTube2 className="h-6 w-6 text-brand-300" aria-hidden="true" />
                </div>
                <dl className="mt-5 space-y-3">
                  {[
                    ['Sentencias', TECH_METRICS.tests.statements],
                    ['Ramas', TECH_METRICS.tests.branches],
                    ['Funciones', TECH_METRICS.tests.functions],
                    ['Líneas', TECH_METRICS.tests.lines],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-white/45">
                        <dt>{label}</dt>
                        <dd className="tabular-nums">{value}%</dd>
                      </div>
                      <div
                        className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"
                        role="presentation"
                      >
                        <div
                          className="h-full rounded-full bg-brand-300"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 font-mono text-[10px] text-white/35">
                  npm run test:coverage
                </p>
              </div>
            </div>

            <div>
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {TEST_FILES.map((test) => (
                  <li key={test.file} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                      <span className="font-mono text-xs font-semibold text-white/85">
                        {test.file}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/40">
                        {test.area}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-5 text-xs leading-5 text-white/50">
                      {test.covers}
                    </p>
                  </li>
                ))}
              </ul>
              <GitHubFileLink
                path="src/lib/availability.test.ts"
                className="mt-4 !text-brand-200 hover:!text-white"
              >
                Abrir la suite
              </GitHubFileLink>
            </div>
          </div>

          <div className="mt-14">
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-brand-300" aria-hidden="true" />
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                Accesibilidad implementada
              </h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ACCESSIBILITY.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <h4 className="text-sm font-bold text-white/85">{item.title}</h4>
                  <p className="mt-2 text-[11px] leading-5 text-white/45">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/35">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Pendiente: auditoría con lector de pantalla y revisión de contraste
              en estados deshabilitados.
            </p>
          </div>
        </div>
      </section>

      <section
        id="rendimiento"
        aria-labelledby="rendimiento-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <SectionHeading
          eyebrow="Rendimiento"
          title={
            <span id="rendimiento-title">
              Medir antes de opinar.
            </span>
          }
          description="La página no muestra un puntaje pregrabado. Lee las métricas de esta visita y las compara con umbrales públicos de Web Vitals."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <RuntimeMetrics />
          </div>
          <div className="space-y-3">
            {PERFORMANCE_NOTES.map((note) => (
              <article
                key={note.title}
                className="rounded-2xl border border-line bg-sand/50 p-4"
              >
                <h3 className="text-sm font-bold text-ink">{note.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-ink/55">{note.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-ink">Chunks de producción</h3>
            <p className="text-[11px] text-ink/40">
              gzip · última compilación · hash omitido
            </p>
          </div>
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Tamaño comprimido de los chunks principales de la compilación
            </caption>
            <thead className="bg-sand/60 text-[10px] uppercase tracking-[0.12em] text-ink/40">
              <tr>
                <th scope="col" className="px-5 py-3 font-extrabold">
                  Chunk
                </th>
                <th scope="col" className="px-5 py-3 font-extrabold">
                  Contenido
                </th>
                <th scope="col" className="px-5 py-3 text-right font-extrabold">
                  gzip
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TECH_METRICS.chunks.map((chunk) => (
                <tr key={chunk.file}>
                  <th scope="row" className="px-5 py-3 font-mono text-[10px] font-semibold text-brand-800">
                    {chunk.file}
                  </th>
                  <td className="px-5 py-3 text-ink/55">{chunk.role}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink/70">
                    {chunk.gzip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-ink/40">
          <FileCode2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Reproducible con <span className="font-mono">npm run build</span>. Los
          tamaños cambian con cada release; la tabla se actualiza con la
          compilación actual.
        </p>
      </section>

      <section
        id="funciones"
        aria-labelledby="funciones-title"
        className="scroll-mt-24 border-y border-line bg-sand/50"
      >
        <div className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            eyebrow="Piezas clave"
            title={
              <span id="funciones-title">
                Cinco funciones que sostienen la agenda.
              </span>
            }
            description="No son las únicas, pero sí las que concentran las reglas que un reclutador técnico querría revisar primero."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {KEY_FUNCTIONS.map((item) => (
              <article
                key={item.name}
                className="flex flex-col rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex items-center gap-2 text-brand-700">
                  <Code2 className="h-4 w-4" aria-hidden="true" />
                  <h3 className="font-mono text-sm font-bold">{item.name}</h3>
                </div>
                <p className="mt-3 flex-1 text-xs leading-5 text-ink/60">
                  {item.summary}
                </p>
                <p className="mt-3 border-t border-line pt-3 text-[10px] font-semibold text-ink/40">
                  {item.detail}
                </p>
                <GitHubFileLink path={item.file} className="mt-3">
                  Ver implementación
                </GitHubFileLink>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl border border-line bg-white p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink/40">
                <LockKeyhole className="h-3.5 w-3.5 text-brand-700" aria-hidden="true" />
                Alcance y límites
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                Demo honesta, no producto clínico.
              </h3>
            </div>
            <div className="space-y-3 text-xs leading-5 text-ink/55">
              <p className="flex items-start gap-2">
                <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                localStorage por navegador, sin sincronización ni respaldo.
              </p>
              <p className="flex items-start gap-2">
                <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                Autenticación simulada: correo para pacientes y credenciales demo para admin.
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                Sin pagos, sin historia clínica y sin datos reales de pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="tech-grid absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-300">
                Código abierto
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Revisa el código, no solo las capturas.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                El repositorio incluye la aplicación completa, la suite de
                pruebas y este mismo dossier. Las decisiones están en los
                archivos, no en una presentación aparte.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: 'inverse', size: 'lg' })}
              >
                <GithubMark />
                Repositorio
                <span className="sr-only"> (abre en una pestaña nueva)</span>
              </a>
              <a
                href={GITHUB_PROFILE}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: 'inverse', size: 'lg' })}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Perfil de GitHub
                <span className="sr-only"> (abre en una pestaña nueva)</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function GithubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.17c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.57-.29-5.27-1.28-5.27-5.72 0-1.26.45-2.3 1.19-3.1-.12-.3-.52-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.23 2.79.11 3.08.74.8 1.19 1.84 1.19 3.1 0 4.45-2.7 5.43-5.28 5.71.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  )
}
