import { describe, expect, it } from 'vitest'
import { addMonths, isOccupied, monthCells, nightsBetween, overlapsOccupied, toIsoDate } from './date'

describe('utilidades del calendario', () => {
  it('construye seis semanas y comienza un lunes', () => {
    const cells = monthCells(new Date(2026, 9, 1, 12))
    expect(cells).toHaveLength(42)
    expect(cells[0].date).toBe('2026-09-28')
    expect(cells.some(cell => cell.date === '2026-10-31' && cell.currentMonth)).toBe(true)
  })

  it('navega entre años y conserva siempre el primer día', () => {
    expect(toIsoDate(addMonths(new Date(2026, 11, 18, 12), 1))).toBe('2027-01-01')
  })

  it('considera ocupado el ingreso pero deja libre la fecha de salida', () => {
    const ranges = [{ checkIn: '2026-10-10', checkOut: '2026-10-13' }]
    expect(isOccupied('2026-10-10', ranges)).toBe(true)
    expect(isOccupied('2026-10-12', ranges)).toBe(true)
    expect(isOccupied('2026-10-13', ranges)).toBe(false)
  })

  it('detecta solapamientos sin bloquear reservas consecutivas', () => {
    const ranges = [{ checkIn: '2026-10-10', checkOut: '2026-10-13' }]
    expect(overlapsOccupied('2026-10-09', '2026-10-11', ranges)).toBe(true)
    expect(overlapsOccupied('2026-10-13', '2026-10-15', ranges)).toBe(false)
  })

  it('calcula la cantidad de noches', () => {
    expect(nightsBetween('2026-10-30', '2026-11-02')).toBe(3)
  })
})
