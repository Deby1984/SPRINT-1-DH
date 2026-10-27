/** @vitest-environment jsdom */
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { changeValue, flushReact, renderReact } from '../../test/reactTestUtils'

const mocks = vi.hoisted(() => ({
  cities: vi.fn(),
}))

vi.mock('../../api', () => ({
  productsApi: { cities: mocks.cities },
}))

vi.mock('../calendar/DoubleCalendar', () => ({
  DoubleCalendar: ({ onChange }: { onChange?: (range: { checkIn: string; checkOut: string }) => void }) =>
    <button type="button" data-testid="mock-range" onClick={() => onChange?.({ checkIn: '2026-11-10', checkOut: '2026-11-12' })}>
      Elegir 10 al 12 de noviembre
    </button>,
}))

import { SearchBlock } from './SearchBlock'

const cleanups: Array<() => Promise<void>> = []

beforeEach(() => {
  vi.useFakeTimers()
  mocks.cities.mockReset().mockResolvedValue(['Bariloche', 'San Carlos de Bariloche'])
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
  vi.useRealTimers()
})

describe('SearchBlock', () => {
  it('ofrece sugerencias, expone la opción activa y envía ciudad y rango elegidos', async () => {
    const onSearch = vi.fn()
    const view = await renderReact(<SearchBlock searching={false} active={false} onSearch={onSearch} onClear={vi.fn()} />)
    cleanups.push(view.cleanup)
    const input = view.container.querySelector<HTMLInputElement>('input[role="combobox"]')!

    await act(async () => {
      changeValue(input, 'Bar')
      await vi.advanceTimersByTimeAsync(251)
    })
    await flushReact()

    expect(mocks.cities).toHaveBeenCalledWith('Bar')
    const options = [...view.container.querySelectorAll<HTMLElement>('[role="option"]')]
    expect(options.map(option => option.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      '⌖BarilocheArgentina',
      '⌖San Carlos de BarilocheArgentina',
    ])
    expect(input.getAttribute('aria-expanded')).toBe('true')

    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
    const activeId = input.getAttribute('aria-activedescendant')
    expect(activeId).toBeTruthy()
    expect(document.getElementById(activeId!)?.getAttribute('aria-selected')).toBe('true')

    await act(async () => options[0].click())
    expect(input.value).toBe('Bariloche')
    expect(input.getAttribute('aria-expanded')).toBe('false')

    await act(async () => view.container.querySelector<HTMLButtonElement>('.date-trigger')?.click())
    await act(async () => view.container.querySelector<HTMLButtonElement>('[data-testid="mock-range"]')?.click())
    await act(async () => [...view.container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'Aplicar fechas')?.click())
    await act(async () => view.container.querySelector<HTMLButtonElement>('.search-submit')?.click())

    expect(onSearch).toHaveBeenCalledWith({
      city: 'Bariloche',
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
    })
  })

  it('valida ciudad y fechas antes de disparar la búsqueda', async () => {
    const onSearch = vi.fn()
    const view = await renderReact(<SearchBlock searching={false} active={false} onSearch={onSearch} onClear={vi.fn()} />)
    cleanups.push(view.cleanup)

    await act(async () => view.container.querySelector<HTMLButtonElement>('.search-submit')?.click())

    const input = view.container.querySelector<HTMLInputElement>('input[role="combobox"]')!
    const dateTrigger = view.container.querySelector<HTMLButtonElement>('.date-trigger')!
    const cityAlert = view.container.querySelector<HTMLElement>('[role="alert"]')!
    expect(cityAlert.textContent).toBe('Ingresá una ciudad o elegí una sugerencia.')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(cityAlert.id)

    await act(async () => changeValue(input, 'Bariloche'))
    await act(async () => view.container.querySelector<HTMLButtonElement>('.search-submit')?.click())

    const datesAlert = view.container.querySelector<HTMLElement>('[role="alert"]')!
    expect(datesAlert.textContent).toBe('Elegí las fechas de ingreso y salida.')
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.hasAttribute('aria-describedby')).toBe(false)
    expect(dateTrigger.getAttribute('aria-invalid')).toBe('true')
    expect(dateTrigger.getAttribute('aria-describedby')).toBe(datesAlert.id)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('oculta sugerencias anteriores al escribir y mantiene la lista cerrada si la API falla', async () => {
    const view = await renderReact(<SearchBlock searching={false} active={false} onSearch={vi.fn()} onClear={vi.fn()} />)
    cleanups.push(view.cleanup)
    const input = view.container.querySelector<HTMLInputElement>('input[role="combobox"]')!

    await act(async () => {
      changeValue(input, 'Bar')
      await vi.advanceTimersByTimeAsync(251)
    })
    await flushReact()
    expect(view.container.querySelector('[role="listbox"]')).not.toBeNull()

    mocks.cities.mockRejectedValueOnce(new Error('Sin conexión'))
    await act(async () => changeValue(input, 'Bari'))
    expect(view.container.querySelector('[role="listbox"]')).toBeNull()
    expect(input.getAttribute('aria-expanded')).toBe('false')

    await act(async () => { await vi.advanceTimersByTimeAsync(251) })
    await flushReact()
    expect(view.container.querySelector('[role="listbox"]')).toBeNull()
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })
})
