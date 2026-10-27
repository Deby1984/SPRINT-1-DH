import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { reviewsApi } from '../../api'
import { useAuth } from '../../auth'
import type { ReviewEligibility, ReviewSummary } from '../../types'
import { errorMessage } from '../../utils/product'
import { RatingBadge } from '../products/RatingBadge'
import { StatusMessage } from '../StatusMessage'

type ReviewsSectionProps = {
  productId: number
  onSummaryChange: (summary: ReviewSummary) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

export function ReviewsSection({ productId, onSummaryChange }: ReviewsSectionProps) {
  const { user } = useAuth()
  const location = useLocation()
  const submitting = useRef(false)
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const next = await reviewsApi.list(productId)
      setSummary(next)
      onSummaryChange(next)
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudieron cargar las valoraciones.'))
    } finally {
      setLoading(false)
    }
  }, [onSummaryChange, productId])

  useEffect(() => { void loadReviews() }, [loadReviews])

  useEffect(() => {
    let active = true
    setEligibility(null)
    if (!user) return () => { active = false }
    reviewsApi.eligibility(productId)
      .then(next => { if (active) setEligibility(next) })
      .catch(reason => {
        if (active) setEligibility({ eligible: false, message: errorMessage(reason, 'No se pudo verificar si podés valorar este producto.') })
      })
    return () => { active = false }
  }, [productId, user])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    if (rating < 1 || rating > 5) {
      setFormError('Elegí una puntuación de 1 a 5 estrellas.')
      return
    }
    submitting.current = true
    setSaving(true)
    setFormError('')
    try {
      await reviewsApi.create({ productId, rating, comment: comment.trim() })
      setRating(0)
      setComment('')
      setEligibility({ eligible: false, message: 'Ya publicaste tu valoración para esta estadía.' })
      await loadReviews()
    } catch (reason) {
      setFormError(errorMessage(reason, 'No se pudo publicar la valoración.'))
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return <section className="reviews-section" aria-labelledby="reviews-title">
    <div className="detail-section-heading">
      <div><p className="kicker">EXPERIENCIAS</p><h2 id="reviews-title">Valoraciones y reseñas</h2></div>
      {summary && <RatingBadge average={summary.averageRating} count={summary.reviewCount} />}
    </div>

    {!user
      ? <p className="review-access">¿Completaste una estadía? <Link to="/login" state={{ from: location.pathname }}>Iniciá sesión para puntuar.</Link></p>
      : eligibility?.eligible
        ? <form className="review-form" onSubmit={submit} noValidate>
          <fieldset disabled={saving}>
            <legend>Tu puntuación</legend>
            <div className="star-picker">{[1, 2, 3, 4, 5].map(value => <button
              type="button"
              key={value}
              onClick={() => { setRating(value); setFormError('') }}
              className={value <= rating ? 'active' : ''}
              aria-pressed={value === rating}
              aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
            >★</button>)}</div>
          </fieldset>
          <label>Contanos tu experiencia (opcional)
            <textarea value={comment} onChange={event => setComment(event.target.value)} rows={4} maxLength={1000} disabled={saving} />
          </label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="primary" disabled={saving}>{saving ? 'Publicando…' : 'Publicar valoración'}</button>
        </form>
        : eligibility && <p className="review-access">{eligibility.message}</p>}

    {loading
      ? <StatusMessage>Cargando reseñas…</StatusMessage>
      : error
        ? <div className="inline-state"><StatusMessage kind="error">{error}</StatusMessage><button type="button" className="outline" onClick={() => void loadReviews()}>Intentar nuevamente</button></div>
        : summary && summary.reviews.length > 0
          ? <div className="review-list">{summary.reviews.map(review => <article key={review.id}>
            <div className="review-heading"><div><b>{review.userName}</b><time dateTime={review.createdAt}>{dateFormatter.format(new Date(review.createdAt))}</time></div><span className="review-stars" aria-label={`${review.rating} de 5 estrellas`}>{[1, 2, 3, 4, 5].map(value => <i key={value} className={value <= review.rating ? 'active' : ''}>★</i>)}</span></div>
            {review.comment && <p>{review.comment}</p>}
          </article>)}</div>
          : <p className="empty-reviews">Todavía no hay valoraciones. La primera experiencia puede ser la tuya.</p>}
  </section>
}
