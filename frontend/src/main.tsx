import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth'
import { FavoritesProvider } from './favorites'
import './styles.css'
import './status.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider><App /></FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
