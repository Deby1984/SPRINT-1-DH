import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { productsApi, reservationsApi } from '../../api'
import { useAuth } from '../../auth'
import type { Availability, DateRange, Product, Reservation } from '../../types'
import { nightsBetween } from '../../utils/date'
import { errorMessage, money } from '../../utils/product'
import { DoubleCalendar } from '../calendar/DoubleCalendar'
import { StatusMessage } from '../StatusMessage'

const availabilityFallback = 'No pudimos cargar la disponibilidad. Intentá nuevamente.'

function availabilityErrorMessage(reason: unknown) {
  if (reason instanceof Error && /failed to fetch|networkerror|load failed/i.test(reason.message)) {
    return availabilityFallback
  }
  return errorMessage(reason, availabilityFallback)
}

export function AvailabilitySection({ product }: { product: Product }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null })
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [rangeError, setRangeError] = useState('')
  const [reservation, setReservation] = useState<Reservation | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setAvailability(await productsApi.availability(product.id))
    } catch (reason) {
      setError(availabilityErrorMessage(reason))
    } finally {
      setLoading(false)
    }
  }, [product.id])

  useEffect(() => { void load() }, [load])

  async function reserve() {
    if (!range.checkIn || !range.checkOut) {
      setRangeError('Elegí una fecha de ingreso y una de salida.')
      return
    }
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}#disponibilidad` } })
      return
    }
    setBooking(true)
    setRangeError('')
    setReservation(null)
    try {
      const created = await reservationsApi.create({ productId: product.id, checkIn: range.checkIn, checkOut: range.checkOut })
      setReservation(created)
      setRange({ checkIn: null, checkOut: null })
      await load()
    } catch (reason) {
      setRangeError(errorMessage(reason, 'No se pudo confirmar la reserva. Revisá las fechas e intentá nuevamente.'))
    } finally {
      setBooking(false)
    }
  }

  const nights = range.checkIn && range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 0

  return <section className="availability-section" id="disponibilidad" aria-labelledby="availability-title">
    <div className="detail-section-heading">
      <div><p className="kicker">DISPONIBILIDAD</p><h2 id="availability-title">Elegí cuándo viajar.</h2></div>
      <div className="calendar-legend"><span><i className="available-swatch" /> Disponible</span><span><i className="occupied-swatch" /> Ocupada</span></div>
    </div>
    {loading
      ? <StatusMessage>Cargando fechas disponibles…</StatusMessage>
      : error
        ? <div className="inline-state"><StatusMessage kind="error">{error}</StatusMessage><button className="outline" type="button" onClick={() => void load()}>Intentar nuevamente</button></div>
        : availability && <>
          <DoubleCalendar
            value={range}
            occupiedRanges={availability.occupiedRanges}
            onChange={next => { setRange(next); setRangeError(''); setReservation(null) }}
            onInvalidRange={setRangeError}
            labelledBy="availability-title"
          />
          <div className="reservation-panel">
            <div>
              <span>{nights > 0 ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : 'Seleccioná ingreso y salida'}</span>
              <strong>{nights > 0 ? money.format(product.price * nights) : `${money.format(product.price)} / noche`}</strong>
            </div>
            <button className="primary" type="button" onClick={() => void reserve()} disabled={booking || !range.checkOut}>
              {booking ? 'Confirmando…' : user ? 'Reservar ahora' : 'Iniciar sesión para reservar'}
            </button>
          </div>
          {rangeError && <p className="form-error reservation-message" role="alert">{rangeError}</p>}
          {reservation && <p className="success-message" role="status">Reserva confirmada para {reservation.checkIn} al {reservation.checkOut}.</p>}
        </>}
  </section>
}
