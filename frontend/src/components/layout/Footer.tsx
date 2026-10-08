import { Brand } from './Brand'

export function Footer() {
  return <footer><Brand /><span>© {new Date().getFullYear()} Horizonte. Hecho para viajar despacio.</span></footer>
}
