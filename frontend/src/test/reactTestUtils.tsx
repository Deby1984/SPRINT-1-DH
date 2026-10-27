import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

export async function renderReact(node: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root: Root = createRoot(container)

  await act(async () => {
    root.render(node)
    await Promise.resolve()
  })

  return {
    container,
    async rerender(next: ReactNode) {
      await act(async () => {
        root.render(next)
        await Promise.resolve()
      })
    },
    async cleanup() {
      await act(async () => root.unmount())
      container.remove()
    },
  }
}

export async function flushReact() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

export function changeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}
