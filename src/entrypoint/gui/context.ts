import type { InjectionKey } from 'vue';
import { inject } from 'vue';
import type { UseCases } from '../../application/ports/in/use-cases';
import { ApiValidationError, DomainError, ValidationError } from '../../domain/exceptions/errors';
export const USE_CASES: InjectionKey<UseCases> = Symbol('use-cases');
export function useApplication() {
  const app = inject(USE_CASES);
  if (!app) throw new Error('Falta configurar los casos de uso.');
  return app;
}
export const errorMessage = (e: unknown) => e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
// Ejercicio 6 de la guía 13: errores por campo, vengan del dominio o de un 400 del backend.
export function fieldErrorsOf(e: unknown): Record<string, string> {
  const fields: Partial<Record<string, string>> = e instanceof ValidationError || e instanceof ApiValidationError ? e.fields : e instanceof DomainError && e.field ? { [e.field]: e.message } : {};
  return Object.fromEntries(Object.entries(fields).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
}
export const roleLabel: Record<string, string> = { ADMIN: 'Administrador general', MEMBER: 'Miembro', REVIEWER: 'Revisor' };
export const statusLabel: Record<string, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', PENDING: 'Pendiente', BLOCKED: 'Bloqueado' };
