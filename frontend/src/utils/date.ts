import type { DateRange, OccupiedRange } from '../types'

const pad = (value: number) => String(value).padStart(2, '0')

export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

export function todayIso() {
  return toIsoDate(new Date())
}

export function firstOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12)
}

export function monthLabel(date: Date) {
  const value = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date)
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export type CalendarCell = { date: string; day: number; currentMonth: boolean }

export function monthCells(month: Date): CalendarCell[] {
  const first = firstOfMonth(month)
  const mondayOffset = (first.getDay() + 6) % 7
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return {
      date: toIsoDate(date),
      day: date.getDate(),
      currentMonth: date.getMonth() === month.getMonth(),
    }
  })
}

export function dateInRange(date: string, range: DateRange) {
  if (!range.checkIn) return false
  if (!range.checkOut) return date === range.checkIn
  return date >= range.checkIn && date <= range.checkOut
}

export function isOccupied(date: string, ranges: OccupiedRange[]) {
  return ranges.some(range => date >= range.checkIn && date < range.checkOut)
}

export function overlapsOccupied(checkIn: string, checkOut: string, ranges: OccupiedRange[]) {
  return ranges.some(range => checkIn < range.checkOut && checkOut > range.checkIn)
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const start = fromIsoDate(checkIn)
  const end = fromIsoDate(checkOut)
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function readableRange(range: DateRange) {
  if (!range.checkIn) return 'Elegí las fechas'
  const formatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' })
  if (!range.checkOut) return `${formatter.format(fromIsoDate(range.checkIn))} - Elegí la salida`
  return `${formatter.format(fromIsoDate(range.checkIn))} - ${formatter.format(fromIsoDate(range.checkOut))}`
}
