/** @vitest-environment jsdom */
import { act } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderReact } from '../../test/reactTestUtils'
import { RouteScrollManager } from './RouteScrollManager'

const cleanups: Array<() => Promise<void>> = []
let scrollTo: ReturnType<typeof vi.fn>
let scrollIntoView: ReturnType<typeof vi.fn>

function Harness() {
  const navigate = useNavigate()
  const location = useLocation()
  return <>
    <RouteScrollManager />
    <button type="button" onClick={() => navigate('/inicio')}>Ir al inicio</button>
    <button type="button" onClick={() => navigate('/detalle#disponibilidad')}>Ir a disponibilidad</button>
    {location.hash === '#disponibilidad' && <section id="disponibilidad">Calendario</section>}
  </>
}

beforeEach(() => {
  scrollTo = vi.fn()
  scrollIntoView = vi.fn()
  Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
  vi.restoreAllMocks()
})

describe('RouteScrollManager', () => {
  it('vuelve al comienzo al cambiar de pantalla', async () => {
    const view = await renderReact(<MemoryRouter initialEntries={['/productos/1']}><Harness /></MemoryRouter>)
    cleanups.push(view.cleanup)
    scrollTo.mockClear()

    await act(async () => view.container.querySelector<HTMLButtonElement>('button')?.click())

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('respeta un ancla interna cuando el contenido está disponible', async () => {
    const view = await renderReact(<MemoryRouter initialEntries={['/']}><Harness /></MemoryRouter>)
    cleanups.push(view.cleanup)
    const buttons = view.container.querySelectorAll<HTMLButtonElement>('button')

    await act(async () => buttons[1].click())

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
  })
})
