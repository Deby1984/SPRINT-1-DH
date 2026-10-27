/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import {
  MAX_IMAGE_BYTES,
  validateCategory,
  validateCharacteristic,
  validateLogin,
  validateProduct,
  validateRegister,
} from './validation'

function image(name = 'casa.jpg', options: FilePropertyBag = {}) {
  return new File(['imagen'], name, { type: 'image/jpeg', ...options })
}

function product(overrides: Partial<Parameters<typeof validateProduct>[0]> = {}) {
  return {
    name: ' Casa frente al mar ',
    description: ' Una casa cómoda ',
    categoryId: '2',
    city: ' Mar del Plata ',
    price: '25000.50',
    characteristicIds: ['1', '3'],
    houseRules: ' No se permiten fiestas ',
    healthAndSafety: ' Respetar las indicaciones ',
    cancellationPolicy: ' Cancelación gratuita hasta 48 horas antes ',
    images: [image()],
    ...overrides,
  }
}

describe('validación de autenticación', () => {
  it('normaliza el correo de login y conserva la contraseña', () => {
    const checked = validateLogin({ email: '  debora@example.com  ', password: ' clave con espacios ' })

    expect(checked).toEqual({
      values: { email: 'debora@example.com', password: ' clave con espacios ' },
      errors: {},
      valid: true,
    })
  })

  it('rechaza correo inválido y contraseña formada solo por espacios', () => {
    const checked = validateLogin({ email: 'correo-invalido', password: '   ' })

    expect(checked.valid).toBe(false)
    expect(checked.errors).toMatchObject({ email: expect.any(String), password: expect.any(String) })
  })

  it('aplica en login los límites de 8 a 72 caracteres de la contraseña', () => {
    expect(validateLogin({ email: 'ana@example.com', password: '1234567' }).errors.password).toContain('8')
    expect(validateLogin({ email: 'ana@example.com', password: 'x'.repeat(73) }).errors.password).toContain('72')
  })

  it('recorta los datos de registro y acepta valores válidos', () => {
    const checked = validateRegister({
      firstName: ' Débora ', lastName: ' Valinotte ', email: ' debora@example.com ', password: 'segura123',
    })

    expect(checked.valid).toBe(true)
    expect(checked.values).toMatchObject({ firstName: 'Débora', lastName: 'Valinotte', email: 'debora@example.com' })
  })

  it('rechaza nombres vacíos y límites inválidos de correo y contraseña', () => {
    const checked = validateRegister({
      firstName: '   ', lastName: 'x'.repeat(61), email: `${'a'.repeat(151)}@example.com`, password: '1234567',
    })

    expect(checked.errors).toMatchObject({
      firstName: expect.any(String), lastName: expect.any(String), email: expect.any(String), password: expect.any(String),
    })
  })

  it('rechaza contraseñas que exceden el máximo del backend', () => {
    expect(validateRegister({
      firstName: 'Ana', lastName: 'Paz', email: 'ana@example.com', password: 'x'.repeat(73),
    }).errors.password).toContain('72')
  })
})

describe('validación de categorías y características', () => {
  it('recorta y acepta una categoría con URL HTTPS', () => {
    const checked = validateCategory({
      title: ' Playa ', description: ' Cerca del mar ', imageUrl: ' https://example.com/playa.jpg ',
    })

    expect(checked.valid).toBe(true)
    expect(checked.values).toEqual({
      title: 'Playa', description: 'Cerca del mar', imageUrl: 'https://example.com/playa.jpg',
    })
  })

  it.each(['ftp://example.com/a.jpg', 'imagen.jpg', 'javascript:alert(1)'])(
    'rechaza la URL de imagen no HTTP/S %s',
    imageUrl => expect(validateCategory({ title: 'Playa', description: 'Descripción', imageUrl }).errors.imageUrl).toBeDefined(),
  )

  it('rechaza campos vacíos o demasiado largos en una categoría', () => {
    const checked = validateCategory({ title: '   ', description: 'x'.repeat(501), imageUrl: '   ' })

    expect(checked.errors).toMatchObject({ title: expect.any(String), description: expect.any(String), imageUrl: expect.any(String) })
  })

  it('recorta y valida una característica', () => {
    const checked = validateCharacteristic({ name: ' Wi-Fi ', icon: ' 📶 ' })

    expect(checked).toMatchObject({ valid: true, values: { name: 'Wi-Fi', icon: '📶' }, errors: {} })
  })

  it('rechaza nombre vacío e ícono demasiado largo', () => {
    const checked = validateCharacteristic({ name: ' ', icon: 'x'.repeat(25) })

    expect(checked.errors).toMatchObject({ name: expect.any(String), icon: expect.any(String) })
  })
})

describe('validación de productos', () => {
  it('normaliza y acepta todos los datos válidos', () => {
    const checked = validateProduct(product())

    expect(checked.valid).toBe(true)
    expect(checked.values).toMatchObject({
      name: 'Casa frente al mar', description: 'Una casa cómoda', categoryId: '2', city: 'Mar del Plata',
      price: '25000.50', characteristicIds: ['1', '3'], houseRules: 'No se permiten fiestas',
      healthAndSafety: 'Respetar las indicaciones', cancellationPolicy: 'Cancelación gratuita hasta 48 horas antes', requireImages: true,
    })
  })

  it('rechaza textos vacíos, categoría y precio inválidos', () => {
    const checked = validateProduct(product({
      name: ' ', description: ' ', city: ' ', categoryId: '0', price: '-1',
    }))

    expect(checked.errors).toMatchObject({
      name: expect.any(String), description: expect.any(String), city: expect.any(String),
      categoryId: expect.any(String), price: expect.any(String),
    })
  })

  it('rechaza textos que superan los límites del backend', () => {
    const checked = validateProduct(product({
      name: 'x'.repeat(121), description: 'x'.repeat(1201), city: 'x'.repeat(101),
    }))

    expect(checked.errors).toMatchObject({ name: expect.any(String), description: expect.any(String), city: expect.any(String) })
  })

  it('exige las tres políticas y recorta su contenido', () => {
    const checked = validateProduct(product({ houseRules: ' ', healthAndSafety: ' ', cancellationPolicy: ' ' }))

    expect(checked.errors).toMatchObject({
      houseRules: expect.any(String), healthAndSafety: expect.any(String), cancellationPolicy: expect.any(String),
    })
  })

  it.each(['', 'texto', 'Infinity', '0', '0.009'])(
    'rechaza el precio incoherente %j',
    price => expect(validateProduct(product({ price })).errors.price).toBeDefined(),
  )

  it('exige al menos una característica válida', () => {
    expect(validateProduct(product({ characteristicIds: [] })).errors.characteristicIds).toBeDefined()
    expect(validateProduct(product({ characteristicIds: ['abc'] })).errors.characteristicIds).toBeDefined()
  })

  it('exige una imagen al crear el producto', () => {
    expect(validateProduct(product({ images: [] })).errors.images).toContain('al menos una')
  })

  it('permite conservar las imágenes existentes durante la edición', () => {
    const checked = validateProduct(product({ images: [], requireImages: false }))

    expect(checked.valid).toBe(true)
    expect(checked.errors.images).toBeUndefined()
  })

  it('rechaza archivos vacíos o que no sean imágenes', () => {
    const empty = new File([], 'vacia.png', { type: 'image/png' })
    const text = new File(['texto'], 'notas.txt', { type: 'text/plain' })

    expect(validateProduct(product({ images: [empty] })).errors.images).toContain('vacía')
    expect(validateProduct(product({ images: [text] })).errors.images).toContain('no es una imagen')
  })

  it('acepta exactamente 5 MB y rechaza imágenes mayores', () => {
    const exact = new File([new Uint8Array(MAX_IMAGE_BYTES)], 'exacta.png', { type: 'image/png' })
    const tooLarge = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'grande.png', { type: 'image/png' })

    expect(validateProduct(product({ images: [exact] })).errors.images).toBeUndefined()
    expect(validateProduct(product({ images: [tooLarge] })).errors.images).toContain('5 MB')
  })
})
