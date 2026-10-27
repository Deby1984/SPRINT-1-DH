import { useEffect, useId, useState } from 'react'
import { productsApi } from '../../api'
import type { DateRange } from '../../types'
import { readableRange } from '../../utils/date'
import { DoubleCalendar } from '../calendar/DoubleCalendar'

export type SearchCriteria = { city: string; checkIn: string; checkOut: string }

type SearchBlockProps = {
  searching: boolean
  active: boolean
  onSearch: (criteria: SearchCriteria) => void
  onClear: () => void
}

export function SearchBlock({ searching, active, onSearch, onClear }: SearchBlockProps) {
  const suggestionsId = `${useId()}-city-suggestions`
  const errorId = `${suggestionsId}-error`
  const [city, setCity] = useState('')
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [chosenCity, setChosenCity] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const query = city.trim()
    if (query && query === chosenCity) {
      setSuggestionsOpen(false)
      return
    }
    if (!query) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    let activeRequest = true
    const timer = window.setTimeout(() => {
      productsApi.cities(query)
        .then(items => {
          if (!activeRequest) return
          setSuggestions(items)
          setSuggestionsOpen(items.length > 0)
          setActiveSuggestion(-1)
        })
        .catch(() => {
          if (activeRequest) {
            setSuggestions([])
            setSuggestionsOpen(false)
            setActiveSuggestion(-1)
          }
        })
    }, 250)
    return () => {
      activeRequest = false
      window.clearTimeout(timer)
    }
  }, [chosenCity, city])

  function chooseCity(value: string) {
    setCity(value)
    setChosenCity(value)
    setSuggestionsOpen(false)
    setActiveSuggestion(-1)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedCity = city.trim()
    if (!normalizedCity) {
      setError('Ingresá una ciudad o elegí una sugerencia.')
      return
    }
    if (!range.checkIn || !range.checkOut) {
      setError('Elegí las fechas de ingreso y salida.')
      setCalendarOpen(true)
      return
    }
    setError('')
    setSuggestionsOpen(false)
    setCalendarOpen(false)
    onSearch({ city: normalizedCity, checkIn: range.checkIn, checkOut: range.checkOut })
  }

  function clear() {
    setCity('')
    setChosenCity('')
    setRange({ checkIn: null, checkOut: null })
    setSuggestions([])
    setSuggestionsOpen(false)
    setCalendarOpen(false)
    setError('')
    onClear()
  }

  function handleCityKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestionsOpen || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion(current => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion(current => current <= 0 ? suggestions.length - 1 : current - 1)
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault()
      chooseCity(suggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      setSuggestionsOpen(false)
    }
  }

  const cityInvalid = error.startsWith('Ingresá')
  const datesInvalid = error.startsWith('Elegí')

  return <section className="search-block" aria-labelledby="search-title">
    <div className="search-intro">
      <p className="kicker">ENCONTRÁ TU PRÓXIMA ESTADÍA</p>
      <h1 id="search-title">¿A dónde querés ir?</h1>
      <p>Elegí un destino y un rango de fechas para ver alojamientos disponibles.</p>
    </div>
    <form className="search-form" onSubmit={submit} noValidate>
      <label className="search-field destination-field">
        <span>Destino</span>
        <input
          value={city}
          onChange={event => {
            setCity(event.target.value)
            setChosenCity('')
            setSuggestions([])
            setSuggestionsOpen(false)
            setActiveSuggestion(-1)
            if (cityInvalid) setError('')
          }}
          onFocus={() => suggestions.length > 0 && city.trim() !== chosenCity && setSuggestionsOpen(true)}
          onKeyDown={handleCityKeys}
          placeholder="Ej. Bariloche"
          autoComplete="off"
          role="combobox"
          aria-expanded={suggestionsOpen}
          aria-controls={suggestionsId}
          aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 ? `${suggestionsId}-option-${activeSuggestion}` : undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-invalid={cityInvalid}
          aria-describedby={cityInvalid ? errorId : undefined}
          disabled={searching}
        />
        {suggestionsOpen && <ul id={suggestionsId} className="suggestions" role="listbox" aria-label="Ciudades sugeridas">
          {suggestions.map((item, index) => <li key={item} role="presentation">
            <button
              type="button"
              role="option"
              id={`${suggestionsId}-option-${index}`}
              aria-selected={index === activeSuggestion}
              className={index === activeSuggestion ? 'active' : ''}
              onMouseDown={event => event.preventDefault()}
              onClick={() => chooseCity(item)}
            >
              <span aria-hidden="true">⌖</span><b>{item}</b><small>Argentina</small>
            </button>
          </li>)}
        </ul>}
      </label>
      <div className="search-field date-field">
        <span>Fechas</span>
        <button
          type="button"
          className="date-trigger"
          onClick={() => setCalendarOpen(current => !current)}
          aria-expanded={calendarOpen}
          aria-invalid={datesInvalid}
          aria-describedby={datesInvalid ? errorId : undefined}
          disabled={searching}
        >
          <span aria-hidden="true">▣</span>{readableRange(range)}
        </button>
      </div>
      <button className="primary search-submit" type="submit" disabled={searching}>{searching ? 'Buscando…' : 'Realizar búsqueda'}</button>
      {active && <button className="ghost search-clear" type="button" onClick={clear} disabled={searching}>Limpiar búsqueda</button>}
      {error && <p id={errorId} className="search-form-error" role="alert">{error}</p>}
      {calendarOpen && <div className="search-calendar-panel">
        <DoubleCalendar value={range} onChange={next => { setRange(next); setError('') }} labelledBy="search-calendar-title" />
        <div className="calendar-panel-footer">
          <span id="search-calendar-title">Seleccioná ingreso y salida</span>
          <button type="button" className="outline" onClick={() => setCalendarOpen(false)} disabled={!range.checkOut}>Aplicar fechas</button>
        </div>
      </div>}
    </form>
  </section>
}
