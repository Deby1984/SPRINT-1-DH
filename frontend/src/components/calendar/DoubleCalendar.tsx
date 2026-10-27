import { useMemo, useState } from 'react'
import type { DateRange, OccupiedRange } from '../../types'
import {
  addMonths,
  dateInRange,
  firstOfMonth,
  fromIsoDate,
  isOccupied,
  monthCells,
  monthLabel,
  overlapsOccupied,
  todayIso,
} from '../../utils/date'

type DoubleCalendarProps = {
  value: DateRange
  onChange?: (range: DateRange) => void
  occupiedRanges?: OccupiedRange[]
  minDate?: string
  onInvalidRange?: (message: string) => void
  labelledBy?: string
}

const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export function DoubleCalendar({
  value,
  onChange,
  occupiedRanges = [],
  minDate = todayIso(),
  onInvalidRange,
  labelledBy,
}: DoubleCalendarProps) {
  const initial = value.checkIn ? fromIsoDate(value.checkIn) : new Date()
  const [visibleMonth, setVisibleMonth] = useState(() => firstOfMonth(initial))
  const secondMonth = useMemo(() => addMonths(visibleMonth, 1), [visibleMonth])
  const earliestMonth = firstOfMonth(fromIsoDate(minDate))
  const canGoBack = visibleMonth.getTime() > earliestMonth.getTime()

  function choose(date: string) {
    if (!onChange) return
    if (!value.checkIn || value.checkOut || date <= value.checkIn) {
      onChange({ checkIn: date, checkOut: null })
      return
    }
    if (overlapsOccupied(value.checkIn, date, occupiedRanges)) {
      onInvalidRange?.('El rango incluye una fecha ocupada. Elegí otras fechas.')
      return
    }
    onChange({ checkIn: value.checkIn, checkOut: date })
  }

  function renderMonth(month: Date) {
    return <section className="calendar-month" key={`${month.getFullYear()}-${month.getMonth()}`}>
      <h3>{monthLabel(month)}</h3>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekDays.map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days">
        {monthCells(month).map(cell => {
          const occupied = isOccupied(cell.date, occupiedRanges)
          const past = cell.date < minDate
          const disabled = !cell.currentMonth || past || occupied || !onChange
          const selected = cell.date === value.checkIn || cell.date === value.checkOut
          const inRange = dateInRange(cell.date, value)
          const label = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(fromIsoDate(cell.date))
          return <button
            type="button"
            key={cell.date}
            className={`${!cell.currentMonth ? 'outside' : ''} ${occupied ? 'occupied' : ''} ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
            disabled={disabled}
            onClick={() => choose(cell.date)}
            aria-label={`${label}${occupied ? ', no disponible' : ''}`}
            aria-pressed={selected}
            title={occupied ? 'Fecha ocupada' : undefined}
          >{cell.day}</button>
        })}
      </div>
    </section>
  }

  return <div className="double-calendar" role="group" aria-labelledby={labelledBy}>
    <div className="calendar-navigation">
      <button type="button" onClick={() => setVisibleMonth(current => addMonths(current, -1))} disabled={!canGoBack} aria-label="Ver meses anteriores">←</button>
      <button type="button" onClick={() => setVisibleMonth(current => addMonths(current, 1))} aria-label="Ver meses siguientes">→</button>
    </div>
    <div className="calendar-pair">{renderMonth(visibleMonth)}{renderMonth(secondMonth)}</div>
  </div>
}
