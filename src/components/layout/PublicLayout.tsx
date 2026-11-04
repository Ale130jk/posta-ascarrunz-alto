import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'

export function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <PublicHeader />
      <main id="contenido-principal" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
