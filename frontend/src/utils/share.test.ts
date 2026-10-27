import { describe, expect, it } from 'vitest'
import { defaultShareMessage, productShareMetadata, shareText, socialShareUrl } from './share'

describe('enlaces para compartir', () => {
  it('codifica la URL para Facebook', () => {
    expect(socialShareUrl('facebook', 'https://example.com/p/1?x=2', 'Texto'))
      .toBe('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fp%2F1%3Fx%3D2')
  })

  it('codifica mensaje y URL para X', () => {
    const result = socialShareUrl('x', 'https://example.com/p/1', 'Una casa & más')
    expect(result).toContain('text=Una%20casa%20%26%20m%C3%A1s')
    expect(result).toContain('url=https%3A%2F%2Fexample.com%2Fp%2F1')
  })

  it('genera un mensaje inicial editable', () => {
    expect(defaultShareMessage('Casa Bruma')).toBe('Mirá Casa Bruma en Horizonte.')
  })

  it('construye la alternativa de Instagram con mensaje y enlace directo', () => {
    expect(shareText('  Un lugar hermoso  ', 'https://example.com/productos/1'))
      .toBe('Un lugar hermoso https://example.com/productos/1')
  })

  it('conserva el enlace cuando el mensaje personalizado está vacío', () => {
    expect(shareText('   ', 'https://example.com/productos/1'))
      .toBe('https://example.com/productos/1')
  })

  it('construye metadatos sociales específicos del producto', () => {
    expect(productShareMetadata(
      '  Casa Bruma  ',
      '  Refugio frente al lago.  ',
      'https://images.example/casa.jpg',
      'https://horizonte.example/productos/1',
    )).toEqual({
      title: 'Casa Bruma | Horizonte',
      description: 'Refugio frente al lago.',
      image: 'https://images.example/casa.jpg',
      url: 'https://horizonte.example/productos/1',
    })
  })
})
