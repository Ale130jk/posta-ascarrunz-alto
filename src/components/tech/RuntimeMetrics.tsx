import { useEffect, useState } from 'react'
import { Activity, Gauge, Network, Timer } from 'lucide-react'
import clsx from 'clsx'

interface RuntimeSnapshot {
  ttfb: number
  fcp: number
  lcp: number
  cls: number
  domReady: number
  load: number
  transferKB: number
  resources: number
}

function readSnapshot(lcp: number, cls: number): RuntimeSnapshot {
  const navigation = performance.getEntriesByType(
    'navigation',
  )[0] as PerformanceNavigationTiming | undefined
  const paint = performance.getEntriesByType('paint')
  const firstPaint = paint.find((entry) => entry.name === 'first-contentful-paint')
  const resources = performance.getEntriesByType(
    'resource',
  ) as PerformanceResourceTiming[]
  const transfer = resources.reduce(
    (total, entry) => total + (entry.transferSize || 0),
    0,
  )

  return {
    ttfb: navigation?.responseStart ?? 0,
    fcp: firstPaint?.startTime ?? 0,
    lcp,
    cls,
    domReady: navigation?.domContentLoadedEventEnd ?? 0,
    load: navigation?.loadEventEnd ?? 0,
    transferKB: transfer / 1024,
    resources: resources.length,
  }
}

function useRuntimeMetrics(): RuntimeSnapshot | null {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot | null>(null)

  useEffect(() => {
    let lcp = 0
    let cls = 0
    let disposed = false
    const observers: PerformanceObserver[] = []

    const update = () => {
      if (disposed) return
      setSnapshot(readSnapshot(lcp, cls))
    }

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const entry = entries[entries.length - 1]
        if (entry) {
          lcp = entry.startTime
          update()
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      observers.push(lcpObserver)
    } catch {
      // El navegador no expone LCP; se muestran las demás métricas.
    }

    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            value?: number
            hadRecentInput?: boolean
          }
          if (!shift.hadRecentInput) cls += shift.value ?? 0
        }
        update()
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      observers.push(clsObserver)
    } catch {
      // El navegador no expone layout-shift; CLS queda sin dato.
    }

    const timer = window.setTimeout(update, 1200)
    window.addEventListener('load', update)
    update()

    return () => {
      disposed = true
      window.clearTimeout(timer)
      window.removeEventListener('load', update)
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  return snapshot
}

function formatMs(value: number | undefined): string {
  return value && value > 0 ? `${Math.round(value)} ms` : '—'
}

function formatKb(value: number | undefined): string {
  return value && value > 0 ? `${Math.round(value)} KB` : '—'
}

function toneFor(value: number, good: number, fair: number) {
  if (!value) return 'neutral'
  if (value <= good) return 'good'
  if (value <= fair) return 'fair'
  return 'poor'
}

const toneStyles = {
  good: 'bg-emerald-500',
  fair: 'bg-amber-500',
  poor: 'bg-red-500',
  neutral: 'bg-ink/20',
}

export function RuntimeMetrics() {
  const metrics = useRuntimeMetrics()
  const lcpTone = toneFor(metrics?.lcp ?? 0, 2500, 4000)
  const clsTone = toneFor(metrics?.cls ?? 0, 0.1, 0.25)
  const ttfbTone = toneFor(metrics?.ttfb ?? 0, 800, 1800)

  const items = [
    {
      label: 'TTFB',
      hint: 'Respuesta del servidor',
      value: formatMs(metrics?.ttfb),
      tone: ttfbTone,
    },
    {
      label: 'FCP',
      hint: 'Primer contenido pintado',
      value: formatMs(metrics?.fcp),
      tone: 'neutral',
    },
    {
      label: 'LCP',
      hint: 'Contenido principal visible',
      value: formatMs(metrics?.lcp),
      tone: lcpTone,
    },
    {
      label: 'CLS',
      hint: 'Estabilidad del layout',
      value: metrics ? metrics.cls.toFixed(3) : '—',
      tone: clsTone,
    },
    {
      label: 'DOM listo',
      hint: 'HTML parseado',
      value: formatMs(metrics?.domReady),
      tone: 'neutral',
    },
    {
      label: 'Transferido',
      hint: metrics ? `${metrics.resources} recursos` : 'Recursos de esta visita',
      value: formatKb(metrics?.transferKB),
      tone: 'neutral',
    },
  ]

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
          <Activity className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
          Medición de esta visita
        </p>
        <span className="text-[11px] text-ink/40">
          Performance API · navegador actual
        </span>
      </div>

      <dl
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-line bg-paper p-3.5"
          >
            <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/40">
              <span
                className={clsx('h-1.5 w-1.5 rounded-full', toneStyles[item.tone as keyof typeof toneStyles])}
                aria-hidden="true"
              />
              {item.label}
            </dt>
            <dd className="mt-1.5 font-display text-xl font-semibold tabular-nums text-ink">
              {item.value}
            </dd>
            <dd className="mt-0.5 text-[10px] leading-4 text-ink/40">{item.hint}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-ink/40">
        <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Los valores cambian según la red, el navegador y la carga del equipo. No
        son un Lighthouse pregrabado: se calculan al abrir esta página.
      </p>
      <p className="sr-only">
        <Timer aria-hidden="true" />
        Métricas de rendimiento medidas en el navegador actual.
        <Network aria-hidden="true" />
      </p>
    </div>
  )
}
