import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Lleva cada pantalla nueva al comienzo y conserva la navegación a anclas
 * internas, incluso cuando el contenido aparece después de una carga de API.
 */
export function RouteScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const targetId = decodeURIComponent(hash.slice(1))
    const scrollToTarget = () => {
      const target = document.getElementById(targetId)
      if (!target) return false
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
      return true
    }

    if (scrollToTarget()) return

    const observer = new MutationObserver(() => {
      if (scrollToTarget()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timeout = window.setTimeout(() => observer.disconnect(), 5000)

    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
    }
  }, [hash, pathname])

  return null
}
