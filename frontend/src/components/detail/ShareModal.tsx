import { useState } from 'react'
import type { Product } from '../../types'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { imageSource } from '../../utils/product'
import { defaultShareMessage, shareText, socialShareUrl, type ShareNetwork } from '../../utils/share'

export function ShareModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [network, setNetwork] = useState<ShareNetwork>('facebook')
  const [message, setMessage] = useState(() => defaultShareMessage(product.name))
  const [status, setStatus] = useState('')
  const [sharing, setSharing] = useState(false)
  const url = window.location.href
  const dialogRef = useDialogFocus<HTMLElement>(true, onClose)

  async function copyContent(showSuccess = true) {
    if (!navigator.clipboard?.writeText) throw new Error('El portapapeles no está disponible.')
    await navigator.clipboard.writeText(shareText(message, url))
    if (showSuccess) setStatus('Mensaje y enlace copiados.')
  }

  async function shareWithApplications() {
    if (!navigator.share) {
      setStatus('El menú de aplicaciones no está disponible en este dispositivo.')
      return
    }
    setSharing(true)
    setStatus('')
    try {
      await navigator.share({ title: product.name, text: message.trim(), url })
      setStatus('Se abrió el menú del dispositivo para compartir el producto.')
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
        setStatus('No se pudo abrir el menú del dispositivo. Podés copiar el mensaje y compartirlo manualmente.')
      }
    } finally {
      setSharing(false)
    }
  }

  async function share() {
    if (sharing) return
    setSharing(true)
    setStatus('')
    try {
      if (network === 'instagram') {
        if (navigator.share) {
          try {
            await navigator.share({ title: product.name, text: message.trim(), url })
            setStatus('Se abrió el menú para compartir. Elegí Instagram si está disponible.')
            return
          } catch (reason) {
            if (reason instanceof DOMException && reason.name === 'AbortError') return
            try {
              await copyContent(false)
              setStatus('No se pudo abrir el menú de aplicaciones. Copiamos el mensaje y el enlace para que puedas abrir Instagram y pegarlos manualmente.')
            } catch {
              setStatus('No se pudo abrir el menú de aplicaciones. Copiá el mensaje y el enlace de la vista previa para publicarlos manualmente en Instagram.')
            }
            return
          }
        }
        window.open(socialShareUrl('instagram', url, message), '_blank', 'noopener,noreferrer')
        try {
          await copyContent(false)
          setStatus('Copiamos el mensaje y solicitamos abrir Instagram para que puedas pegarlo en tu publicación.')
        } catch {
          setStatus('Solicitamos abrir Instagram. Si no aparece, habilitá las ventanas emergentes y copiá el contenido manualmente.')
        }
        return
      }

      window.open(socialShareUrl(network, url, message), '_blank', 'noopener,noreferrer')
      if (network === 'facebook') {
        try {
          await copyContent(false)
          setStatus('Solicitamos abrir Facebook. También copiamos tu mensaje para que puedas pegarlo en la publicación.')
        } catch {
          setStatus('Solicitamos abrir Facebook. Si el navegador bloqueó la ventana, habilitá las ventanas emergentes e intentá nuevamente.')
        }
      } else {
        setStatus('Solicitamos abrir X con el mensaje y el enlace preparados. Si no aparece, revisá el bloqueo de ventanas emergentes.')
      }
    } finally {
      setSharing(false)
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} tabIndex={-1} className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar ventana">×</button>
      <p className="kicker">RECOMENDÁ ESTA ESTADÍA</p>
      <h2 id="share-title">Compartir producto</h2>
      <div className="share-preview">
        <img src={imageSource(product.images[0])} alt={`Vista de ${product.name}`} />
        <div><h3>{product.name}</h3><p>{product.description}</p><small>{url}</small></div>
      </div>
      <fieldset className="social-options">
        <legend>Elegí una red social</legend>
        {(['facebook', 'x', 'instagram'] as ShareNetwork[]).map(item => <button
          type="button"
          key={item}
          className={network === item ? 'selected' : ''}
          onClick={() => setNetwork(item)}
          aria-pressed={network === item}
        >{item === 'x' ? 'X / Twitter' : item.charAt(0).toUpperCase() + item.slice(1)}</button>)}
      </fieldset>
      <label className="share-message">Mensaje personalizado
        <textarea value={message} onChange={event => setMessage(event.target.value)} rows={3} maxLength={280} />
      </label>
      <div className="modal-actions">
        <button type="button" className="ghost dark" disabled={sharing} onClick={() => void copyContent().catch(() => setStatus('No se pudo copiar automáticamente. Seleccioná el enlace de la vista previa.'))}>Copiar mensaje y enlace</button>
        {typeof navigator.share === 'function' && <button type="button" className="outline" disabled={sharing} onClick={() => void shareWithApplications()}>Otras aplicaciones</button>}
        <button type="button" className="primary" disabled={sharing} onClick={() => void share()}>{sharing ? 'Abriendo…' : 'Compartir'}</button>
      </div>
      {status && <p className="share-status" role="status">{status}</p>}
    </section>
  </div>
}
