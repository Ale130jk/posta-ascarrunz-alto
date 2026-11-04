import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, House } from 'lucide-react'
import { Brand } from '../../components/ui/Brand'
import { buttonStyles } from '../../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-sand">
      <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-6">
        <Link to="/" aria-label="Ir al inicio">
          <Brand />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/50 transition hover:text-brand-700"
        >
          <House className="h-3.5 w-3.5" aria-hidden="true" />
          Inicio
        </Link>
      </header>

      <main
        id="contenido-principal"
        className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-6"
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-700 shadow-lg shadow-brand-900/5">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">
          Esta página no
          <br />
          <span className="italic text-brand-700">está en la agenda.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-ink/55">
          La dirección que buscaste no existe o cambió de lugar. Vuelve al inicio
          para reservar tu cita en la Posta Médica Ascarrunz Alto.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link to="/" className={buttonStyles({ size: 'lg' })}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link
            to="/mi-cuenta/reservar"
            className={buttonStyles({ variant: 'outline', size: 'lg' })}
          >
            Reservar una cita
          </Link>
        </div>

        <p className="mt-10 text-[10px] leading-5 text-ink/35">
          Posta Médica Ascarrunz Alto · San Juan de Lurigancho, Lima
        </p>
      </main>
    </div>
  )
}
