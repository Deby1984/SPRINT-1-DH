import { useEffect, useRef } from 'react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter(element => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true')
}

/**
 * Mantiene el foco dentro de un diálogo abierto, permite cerrarlo con Escape y
 * devuelve el foco al control que lo abrió cuando el diálogo desaparece.
 */
export function useDialogFocus<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const dialogRef = useRef<T>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const currentDialog = dialogRef.current
    if (!currentDialog) return
    const dialog: HTMLElement = currentDialog
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const firstControl = focusableElements(dialog)[0]
    ;(firstControl ?? dialog).focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const controls = focusableElements(dialog)
      if (controls.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = controls[0]
      const last = controls[controls.length - 1]
      const activeElement = document.activeElement
      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
    }
  }, [open])

  return dialogRef
}
