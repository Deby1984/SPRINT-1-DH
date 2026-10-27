/** @vitest-environment jsdom */
import { act, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../types'
import { changeValue, flushReact, renderReact } from '../../test/reactTestUtils'
import { ShareModal } from './ShareModal'

const product: Product = {
  id: 77,
  name: 'Casa Bruma',
  description: 'Una casa tranquila frente al lago.',
  categoryId: 1,
  category: 'Cabañas',
  city: 'Bariloche',
  price: 145000,
  images: ['https://example.com/casa-bruma.jpg'],
  characteristics: [],
  policies: [],
  averageRating: 4.8,
  reviewCount: 12,
}

const cleanups: Array<() => Promise<void>> = []
let writeText: ReturnType<typeof vi.fn>

function button(container: HTMLElement, text: string) {
  const result = [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(item => item.textContent === text)
  if (!result) throw new Error(`No se encontró el botón ${text}`)
  return result
}

function Harness() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" onClick={() => setOpen(true)}>Abrir compartir</button>
    {open && <ShareModal product={product} onClose={() => setOpen(false)} />}
  </>
}

beforeEach(() => {
  window.history.pushState({}, '', '/productos/77?origen=prueba')
  writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: undefined,
  })
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
  vi.restoreAllMocks()
})

describe('ShareModal', () => {
  it('muestra la imagen, descripción, enlace directo, redes y un mensaje editable', async () => {
    const view = await renderReact(<ShareModal product={product} onClose={vi.fn()} />)
    cleanups.push(view.cleanup)
    const dialog = view.container.querySelector<HTMLElement>('[role="dialog"]')

    expect(dialog?.getAttribute('aria-labelledby')).toBe('share-title')
    expect(dialog?.textContent).toContain(product.name)
    expect(dialog?.textContent).toContain(product.description)
    expect(dialog?.textContent).toContain(window.location.href)
    expect(dialog?.querySelector<HTMLImageElement>('img')?.getAttribute('src')).toBe(product.images[0])
    expect(['Facebook', 'X / Twitter', 'Instagram'].every(label => dialog?.textContent?.includes(label))).toBe(true)

    const textarea = dialog?.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea?.value).toBe('Mirá Casa Bruma en Horizonte.')
    await act(async () => changeValue(textarea!, 'Mi recomendación personalizada'))
    expect(textarea?.value).toBe('Mi recomendación personalizada')
  })

  it('abre X con el mensaje editable y el enlace codificados', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const view = await renderReact(<ShareModal product={product} onClose={vi.fn()} />)
    cleanups.push(view.cleanup)
    const textarea = view.container.querySelector<HTMLTextAreaElement>('textarea')!

    await act(async () => changeValue(textarea, 'Una casa & más'))
    await act(async () => button(view.container, 'X / Twitter').click())
    await act(async () => button(view.container, 'Compartir').click())
    await flushReact()

    expect(open).toHaveBeenCalledWith(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent('Una casa & más')}&url=${encodeURIComponent(window.location.href)}`,
      '_blank',
      'noopener,noreferrer',
    )
    expect(view.container.querySelector('[role="status"]')?.textContent)
      .toContain('X con el mensaje y el enlace preparados')
  })

  it('copia el mensaje personalizado junto al enlace directo', async () => {
    const view = await renderReact(<ShareModal product={product} onClose={vi.fn()} />)
    cleanups.push(view.cleanup)
    const textarea = view.container.querySelector<HTMLTextAreaElement>('textarea')!

    await act(async () => changeValue(textarea, 'Quiero conocer este lugar'))
    await act(async () => button(view.container, 'Copiar mensaje y enlace').click())
    await flushReact()

    expect(writeText).toHaveBeenCalledWith(`Quiero conocer este lugar ${window.location.href}`)
    expect(view.container.querySelector('[role="status"]')?.textContent).toBe('Mensaje y enlace copiados.')
  })

  it('cierra por botón, Escape y fondo, y devuelve el foco al control que lo abrió', async () => {
    const view = await renderReact(<Harness />)
    cleanups.push(view.cleanup)
    const opener = button(view.container, 'Abrir compartir')

    opener.focus()
    await act(async () => opener.click())
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Cerrar ventana')
    await act(async () => view.container.querySelector<HTMLButtonElement>('[aria-label="Cerrar ventana"]')?.click())
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(opener)

    await act(async () => opener.click())
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(opener)

    await act(async () => opener.click())
    const backdrop = view.container.querySelector<HTMLElement>('.modal-backdrop')!
    await act(async () => backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(opener)
  })
})
