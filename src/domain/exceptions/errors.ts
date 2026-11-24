// Ejercicio 6 de la guía 13: los errores saben a qué campo pertenecen.
export type UserField = 'id' | 'name' | 'email' | 'password' | 'role' | 'status';
export type FieldErrors = Partial<Record<UserField, string>>;

export class DomainError extends Error {
  constructor(message: string, public readonly field?: UserField) { super(message); }
}
/** Varias reglas del dominio fallaron a la vez; `fields` dice cuál falló en cada campo. */
export class ValidationError extends DomainError {
  constructor(public readonly fields: FieldErrors) { super(Object.values(fields).join(' ')); }
}
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
/** Un 400 del backend con el formato "campo: mensaje, campo: mensaje". */
export class ApiValidationError extends ApiError {
  constructor(message: string, public readonly fields: Record<string, string>) { super(message, 400); }
}
export class UnauthorizedError extends ApiError {
  constructor() { super('Tu sesión venció. Inicia sesión nuevamente.', 401); }
}
