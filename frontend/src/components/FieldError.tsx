import type { FieldErrors } from '../types'

export function FieldError({ errors, name }: { errors: FieldErrors; name: string }) {
  const message = errors[name]
  if (!message) return null
  return <small className="field-error" id={`${name}-error`} role="alert">{message}</small>
}

export function fieldErrorAttributes(errors: FieldErrors, name: string) {
  return errors[name]
    ? { 'aria-invalid': true as const, 'aria-describedby': `${name}-error` }
    : { 'aria-invalid': false as const }
}
