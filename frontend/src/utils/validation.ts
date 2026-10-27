import type { FieldErrors } from '../types'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export type ValidationResult<T> = {
  values: T
  errors: FieldErrors
  valid: boolean
}

export type LoginValues = {
  email: string
  password: string
}

export type RegisterValues = LoginValues & {
  firstName: string
  lastName: string
}

export type CategoryValues = {
  title: string
  description: string
  imageUrl: string
}

export type CharacteristicValues = {
  name: string
  icon: string
}

export type ProductFormValues = {
  name: string
  description: string
  categoryId: string
  city: string
  price: string
  characteristicIds: string[]
  houseRules: string
  healthAndSafety: string
  cancellationPolicy: string
  images: File[]
  requireImages: boolean
}

type ProductFormInput = Omit<ProductFormValues, 'categoryId' | 'price' | 'characteristicIds' | 'images' | 'requireImages'> & {
  categoryId: string | number | null | undefined
  price: string | number | null | undefined
  characteristicIds: readonly (string | number)[]
  images: readonly File[]
  requireImages?: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function result<T>(values: T, errors: FieldErrors): ValidationResult<T> {
  return { values, errors, valid: Object.keys(errors).length === 0 }
}

function required(value: string, field: string, label: string, errors: FieldErrors) {
  if (!value) {
    const adjective = label.startsWith('La ') ? 'obligatoria' : 'obligatorio'
    errors[field] = `${label} es ${adjective}.`
  }
}

function maxLength(value: string, field: string, maximum: number, errors: FieldErrors) {
  if (value.length > maximum && !errors[field]) {
    errors[field] = `No puede superar los ${maximum} caracteres.`
  }
}

export function validateLogin(input: LoginValues): ValidationResult<LoginValues> {
  const values = { email: input.email.trim(), password: input.password }
  const errors: FieldErrors = {}
  required(values.email, 'email', 'El correo electrónico', errors)
  if (values.email && !EMAIL_PATTERN.test(values.email)) errors.email = 'Ingresá un correo electrónico válido.'
  required(values.password.trim(), 'password', 'La contraseña', errors)
  if (values.password.trim() && values.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres.'
  if (values.password.length > 72) errors.password = 'No puede superar los 72 caracteres.'
  return result(values, errors)
}

export function validateRegister(input: RegisterValues): ValidationResult<RegisterValues> {
  const values = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    password: input.password,
  }
  const errors: FieldErrors = {}
  required(values.firstName, 'firstName', 'El nombre', errors)
  maxLength(values.firstName, 'firstName', 60, errors)
  required(values.lastName, 'lastName', 'El apellido', errors)
  maxLength(values.lastName, 'lastName', 60, errors)
  required(values.email, 'email', 'El correo electrónico', errors)
  if (values.email && !EMAIL_PATTERN.test(values.email)) errors.email = 'Ingresá un correo electrónico válido.'
  maxLength(values.email, 'email', 160, errors)
  required(values.password.trim(), 'password', 'La contraseña', errors)
  if (values.password.trim() && values.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres.'
  if (values.password.length > 72) errors.password = 'No puede superar los 72 caracteres.'
  return result(values, errors)
}

export function validateCategory(input: CategoryValues): ValidationResult<CategoryValues> {
  const values = {
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim(),
  }
  const errors: FieldErrors = {}
  required(values.title, 'title', 'El título', errors)
  maxLength(values.title, 'title', 60, errors)
  required(values.description, 'description', 'La descripción', errors)
  maxLength(values.description, 'description', 500, errors)
  required(values.imageUrl, 'imageUrl', 'La URL de la imagen', errors)
  maxLength(values.imageUrl, 'imageUrl', 2048, errors)
  if (values.imageUrl && !errors.imageUrl) {
    try {
      const url = new URL(values.imageUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
    } catch {
      errors.imageUrl = 'Ingresá una URL válida que comience con http:// o https://.'
    }
  }
  return result(values, errors)
}

export function validateCharacteristic(input: CharacteristicValues): ValidationResult<CharacteristicValues> {
  const values = { name: input.name.trim(), icon: input.icon.trim() }
  const errors: FieldErrors = {}
  required(values.name, 'name', 'El nombre', errors)
  maxLength(values.name, 'name', 60, errors)
  required(values.icon, 'icon', 'El ícono', errors)
  maxLength(values.icon, 'icon', 24, errors)
  return result(values, errors)
}

export function validateProduct(input: ProductFormInput): ValidationResult<ProductFormValues> {
  const values: ProductFormValues = {
    name: input.name.trim(),
    description: input.description.trim(),
    categoryId: String(input.categoryId ?? '').trim(),
    city: input.city.trim(),
    price: String(input.price ?? '').trim(),
    characteristicIds: input.characteristicIds.map(String).map(value => value.trim()).filter(Boolean),
    houseRules: input.houseRules.trim(),
    healthAndSafety: input.healthAndSafety.trim(),
    cancellationPolicy: input.cancellationPolicy.trim(),
    images: Array.from(input.images),
    requireImages: input.requireImages ?? true,
  }
  const errors: FieldErrors = {}
  required(values.name, 'name', 'El nombre', errors)
  maxLength(values.name, 'name', 120, errors)
  required(values.description, 'description', 'La descripción', errors)
  maxLength(values.description, 'description', 1200, errors)
  required(values.city, 'city', 'La ciudad', errors)
  maxLength(values.city, 'city', 100, errors)
  required(values.houseRules, 'houseRules', 'Las normas de la casa', errors)
  maxLength(values.houseRules, 'houseRules', 1200, errors)
  required(values.healthAndSafety, 'healthAndSafety', 'La información de salud y seguridad', errors)
  maxLength(values.healthAndSafety, 'healthAndSafety', 1200, errors)
  required(values.cancellationPolicy, 'cancellationPolicy', 'La política de cancelación', errors)
  maxLength(values.cancellationPolicy, 'cancellationPolicy', 1200, errors)

  const category = Number(values.categoryId)
  if (!values.categoryId) errors.categoryId = 'Seleccioná una categoría.'
  else if (!Number.isInteger(category) || category <= 0) errors.categoryId = 'La categoría seleccionada no es válida.'

  const price = Number(values.price)
  if (!values.price) errors.price = 'El precio es obligatorio.'
  else if (!Number.isFinite(price) || price < 0.01) errors.price = 'Ingresá un precio válido mayor o igual a 0,01.'

  if (!values.characteristicIds.length) {
    errors.characteristicIds = 'Elegí al menos una característica.'
  } else if (values.characteristicIds.some(id => !Number.isInteger(Number(id)) || Number(id) <= 0)) {
    errors.characteristicIds = 'Una de las características seleccionadas no es válida.'
  }

  if (values.requireImages && !values.images.length) {
    errors.images = 'Subí al menos una imagen.'
  } else {
    const empty = values.images.find(file => file.size === 0)
    const invalidType = values.images.find(file => !file.type.toLowerCase().startsWith('image/'))
    const tooLarge = values.images.find(file => file.size > MAX_IMAGE_BYTES)
    if (empty) errors.images = `La imagen “${empty.name}” está vacía.`
    else if (invalidType) errors.images = `El archivo “${invalidType.name}” no es una imagen válida.`
    else if (tooLarge) errors.images = `La imagen “${tooLarge.name}” supera el máximo de 5 MB.`
  }

  return result(values, errors)
}
