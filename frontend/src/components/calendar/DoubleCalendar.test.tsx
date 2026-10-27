/** @vitest-environment jsdom */
import { act, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DateRange, OccupiedRange } from '../../types'
import { renderReact } from '../../test/reactTestUtils'
import { DoubleCalendar } from './DoubleCalendar'

const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
})

function CalendarHarness({
  initial,
  occupiedRanges = [],
  onInvalidRange,
}: {
  initial: DateRange
  occupiedRanges?: OccupiedRange[]
  onInvalidRange?: (message: string) => void
}) {
  const [range, setRange] = useState(initial)
  return <>
    <output data-testid="range">{range.checkIn ?? '-'}|{range.checkOut ?? '-'}</output>
    <DoubleCalendar
      value={range}
      onChange={setRange}
      occupiedRanges={occupiedRanges}
      minDate="2026-10-01"
      onInvalidRange={onInvalidRange}
      labelledBy="calendar-title"
    />
  </>
}

function day(container: HTMLElement, prefix: string) {
  const result = [...container.querySelectorAll<HTMLButtonElement>('button[aria-label]')]
    .find(button => button.getAttribute('aria-label')?.startsWith(prefix) && !button.classList.contains('outside'))
  if (!result) throw new Error(`No se encontró la fecha ${prefix}`)
  return result
}

describe('DoubleCalendar', () => {
  it('completa un rango y refleja visualmente ingreso, salida e intervalo', async () => {
    const view = await renderReact(<CalendarHarness initial={{ checkIn: '2026-10-10', checkOut: null }} />)
    cleanups.push(view.cleanup)

    await act(async () => day(view.container, 'lunes, 12 de octubre de 2026').click())

    expect(view.container.querySelector('[data-testid="range"]')?.textContent).toBe('2026-10-10|2026-10-12')
    expect(day(view.container, 'sábado, 10 de octubre de 2026').getAttribute('aria-pressed')).toBe('true')
    expect(day(view.container, 'domingo, 11 de octubre de 2026').classList.contains('in-range')).toBe(true)
    expect(day(view.container, 'lunes, 12 de octubre de 2026').getAttribute('aria-pressed')).toBe('true')
  })

  it('distingue fechas ocupadas, mantiene libre el egreso e impide atravesar un rango ocupado', async () => {
    const invalid = vi.fn()
    const view = await renderReact(<CalendarHarness
      initial={{ checkIn: '2026-10-10', checkOut: null }}
      occupiedRanges={[{ checkIn: '2026-10-11', checkOut: '2026-10-13' }]}
      onInvalidRange={invalid}
    />)
    cleanups.push(view.cleanup)

    const occupied = day(view.container, 'domingo, 11 de octubre de 2026')
    const checkout = day(view.container, 'martes, 13 de octubre de 2026')
    expect(occupied.disabled).toBe(true)
    expect(occupied.classList.contains('occupied')).toBe(true)
    expect(occupied.title).toBe('Fecha ocupada')
    expect(checkout.disabled).toBe(false)

    await act(async () => day(view.container, 'miércoles, 14 de octubre de 2026').click())

    expect(invalid).toHaveBeenCalledWith('El rango incluye una fecha ocupada. Elegí otras fechas.')
    expect(view.container.querySelector('[data-testid="range"]')?.textContent).toBe('2026-10-10|-')
  })

  it('muestra dos meses consecutivos y permite navegar hacia adelante', async () => {
    const view = await renderReact(<CalendarHarness initial={{ checkIn: '2026-10-10', checkOut: null }} />)
    cleanups.push(view.cleanup)

    expect([...view.container.querySelectorAll('h3')].map(item => item.textContent)).toEqual([
      'Octubre de 2026',
      'Noviembre de 2026',
    ])

    await act(async () => view.container.querySelector<HTMLButtonElement>('[aria-label="Ver meses siguientes"]')?.click())

    expect([...view.container.querySelectorAll('h3')].map(item => item.textContent)).toEqual([
      'Noviembre de 2026',
      'Diciembre de 2026',
    ])
  })
})
