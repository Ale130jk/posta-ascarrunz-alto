import { useMemo, useState } from 'react'
import {
  CheckCheck,
  Mail,
  MailOpen,
  MessagesSquare,
  Phone,
  Search,
  Trash2,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinic } from '../../context/ClinicContext'
import { useToast } from '../../components/ui/Toast'
import { PageHeader, StatCard, EmptyState } from '../../components/ui/Page'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { TextField } from '../../components/ui/Fields'
import { formatTimestamp } from '../../lib/dates'
import type { ContactMessage } from '../../types'

type Filter = 'all' | 'unread' | 'read'

export function MessagesPage() {
  const { data, markMessageRead, markAllMessagesRead, deleteMessage } = useClinic()
  const toast = useToast()

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ContactMessage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)

  const unread = data.messages.filter((message) => !message.read).length
  const read = data.messages.length - unread

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.messages
      .filter((message) => {
        if (filter === 'unread' && message.read) return false
        if (filter === 'read' && !message.read) return false
        if (!needle) return true
        return [message.name, message.email, message.phone, message.message]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }, [data.messages, filter, query])

  const selected =
    filtered.find((message) => message.id === selectedId) ??
    filtered[0] ??
    null

  const openMessage = (message: ContactMessage) => {
    setSelectedId(message.id)
    if (!message.read) {
      markMessageRead(message.id)
    }
  }

  const openDetail = (message: ContactMessage) => {
    setDetail(message)
    if (!message.read) {
      markMessageRead(message.id)
    }
  }

  const handleMarkAll = () => {
    if (unread === 0) return
    const result = markAllMessagesRead()
    if (!result.ok) {
      toast(result.error ?? 'No se pudieron marcar los mensajes.', 'error')
      return
    }
    toast('Todos los mensajes quedaron como leídos.', 'success')
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const result = deleteMessage(deleteTarget.id)
    setDeleteTarget(null)
    setDetail(null)
    if (!result.ok) {
      toast(result.error ?? 'No se pudo eliminar el mensaje.', 'error')
      return
    }
    if (selectedId === deleteTarget.id) setSelectedId(null)
    toast('Mensaje eliminado de la bandeja.', 'success')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mensajes"
        title="Consultas de la comunidad."
        description="Mensajes enviados desde la página pública. Revísalos y responde al correo o teléfono del paciente."
        actions={
          <Button
            variant="outline"
            onClick={handleMarkAll}
            disabled={unread === 0}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Marcar todo como leído
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Sin leer"
          value={unread}
          hint="Pendientes de revisión"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          tone="amber"
        />
        <StatCard
          label="Leídos"
          value={read}
          hint="Mensajes ya revisados"
          icon={<MailOpen className="h-4 w-4" aria-hidden="true" />}
          tone="emerald"
        />
        <StatCard
          label="Total"
          value={data.messages.length}
          hint="Consultas recibidas"
          icon={<MessagesSquare className="h-4 w-4" aria-hidden="true" />}
          tone="sky"
        />
      </div>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm shadow-ink/[0.02] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
            {(
              [
                { id: 'all', label: 'Todos', count: data.messages.length },
                { id: 'unread', label: 'Sin leer', count: unread },
                { id: 'read', label: 'Leídos', count: read },
              ] as { id: Filter; label: string; count: number }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition',
                  filter === item.id
                    ? 'bg-brand-700 text-white'
                    : 'text-ink/50 hover:bg-sand hover:text-ink',
                )}
              >
                {item.label}
                <span
                  className={clsx(
                    'grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-extrabold',
                    filter === item.id ? 'bg-white/20' : 'bg-sand text-ink/45',
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <TextField
              label="Buscar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, correo o mensaje"
              className="pl-9"
            />
            <Search
              className="pointer-events-none absolute left-3 top-[2.4rem] h-4 w-4 text-ink/35"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
          title={
            filter === 'unread'
              ? 'No hay mensajes sin leer'
              : 'No hay mensajes con esos filtros'
          }
          description="Los mensajes enviados desde la página pública aparecerán aquí."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {filtered.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => openMessage(message)}
                className={clsx(
                  'w-full rounded-2xl border p-4 text-left transition',
                  selected?.id === message.id
                    ? 'border-brand-300 bg-brand-50/60 shadow-sm'
                    : 'border-line bg-white hover:border-brand-200 hover:bg-sand/40',
                  !message.read && 'border-l-4 border-l-accent-400',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={clsx(
                        'truncate text-sm',
                        message.read
                          ? 'font-semibold text-ink/75'
                          : 'font-bold text-ink',
                      )}
                    >
                      {message.name}
                    </p>
                    <p className="truncate text-[10px] text-ink/40">
                      {message.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[9px] font-semibold text-ink/35">
                      {formatTimestamp(message.createdAt)}
                    </span>
                    {!message.read && (
                      <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em] text-accent-800">
                        Nuevo
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/50">
                  {message.message}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <article className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02] sm:p-6">
                <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-lg font-semibold text-brand-800">
                      {selected.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-xl font-semibold text-ink">
                        {selected.name}
                      </h2>
                      <p className="truncate text-xs text-ink/45">
                        {formatTimestamp(selected.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetail(selected)}
                      className="lg:hidden"
                    >
                      Ver completo
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(selected)}
                      className="grid h-9 w-9 place-items-center rounded-full text-ink/40 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar mensaje"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-bold text-ink/65 transition hover:border-brand-300 hover:text-brand-800"
                  >
                    <Mail className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-bold text-ink/65 transition hover:border-brand-300 hover:text-brand-800"
                    >
                      <Phone className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                      {selected.phone}
                    </a>
                  )}
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-ink/70">
                  {selected.message}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-[10px] text-ink/40">
                    Responde directamente al correo o llama al paciente.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetail(selected)}
                    >
                      Ver completo
                    </Button>
                    <a
                      href={`mailto:${selected.email}?subject=Respuesta%20de%20Posta%20M%C3%A9dica%20Ascarrunz%20Alto`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-brand-700 px-3.5 text-xs font-semibold text-white transition hover:bg-brand-800"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      Responder
                    </a>
                  </div>
                </div>
              </article>
            ) : (
              <EmptyState
                icon={<MailOpen className="h-5 w-5" aria-hidden="true" />}
                title="Selecciona un mensaje"
                description="Elige una consulta de la lista para leerla completa."
                className="bg-white"
              />
            )}
          </div>
        </div>
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.name ?? 'Mensaje'}
        description={detail ? formatTimestamp(detail.createdAt) : undefined}
        size="md"
        footer={
          detail ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteTarget(detail)
                  setDetail(null)
                }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </Button>
              <a
                href={`mailto:${detail.email}?subject=Respuesta%20de%20Posta%20M%C3%A9dica%20Ascarrunz%20Alto`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Responder por correo
              </a>
            </>
          ) : undefined
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sand px-3 py-1.5 text-[11px] font-bold text-ink/60">
                <Mail className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                {detail.email}
              </span>
              {detail.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sand px-3 py-1.5 text-[11px] font-bold text-ink/60">
                  <Phone className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  {detail.phone}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line rounded-xl bg-sand/50 p-4 text-sm leading-7 text-ink/70">
              {detail.message}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar mensaje"
        description={
          deleteTarget ? (
            <>
              Se eliminará el mensaje de <strong>{deleteTarget.name}</strong>. Esta
              acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Mantener"
      />
    </div>
  )
}
