export function RatingBadge({ average, count }: { average: number; count: number }) {
  if (!count) return <span className="rating-badge empty">Sin valoraciones</span>
  return <span className="rating-badge" aria-label={`${average.toFixed(1)} de 5, ${count} valoraciones`}>
    <span aria-hidden="true">★</span> {average.toFixed(1)} <small>({count})</small>
  </span>
}
