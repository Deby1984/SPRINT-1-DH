import { Link } from 'react-router-dom'

export function Brand() {
  return <Link to="/" className="brand" aria-label="Horizonte, página principal"><span className="brand-mark">H</span><span><strong>Horizonte</strong><small>estancias que inspiran</small></span></Link>
}
