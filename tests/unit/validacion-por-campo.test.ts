// Ejercicio 6 de la guía 13: mensajes de validación por campo.
import { describe, it, expect, vi } from 'vitest';
import { UserApplicationService } from '../../src/application/services/UserApplicationService';
import { HttpClient, parseFieldErrors } from '../../src/adapters/http/HttpClient';
import { BrowserSessionStore } from '../../src/adapters/storage/BrowserSessionStore';
import { ApiValidationError, ValidationError } from '../../src/domain/exceptions/errors';
import type { UserGateway } from '../../src/domain/ports/out/UserGateway';

function memory() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear(), key: () => null, get length() { return values.size; } } as Storage;
}

describe('validación por campo', () => {
  it('el dominio informa todos los campos inválidos a la vez y no llama al puerto', async () => {
    const create = vi.fn();
    const app = new UserApplicationService({ create } as unknown as UserGateway, new BrowserSessionStore(memory()));
    const attempt = app.create({ id: 'u1', name: '  Al  ', email: 'ana@correo', password: '        ', role: 'MEMBER' });
    await expect(attempt).rejects.toBeInstanceOf(ValidationError);
    await expect(attempt).rejects.toMatchObject({ fields: {
      name: 'El nombre debe tener al menos 3 caracteres.',
      email: 'Ingresa un correo electrónico válido.',
      password: 'La contraseña debe tener al menos 8 caracteres.',
    } });
    expect(create).not.toHaveBeenCalled();
  });

  it('en edición la contraseña vacía no es un error de campo', async () => {
    const update = vi.fn(async (u) => u);
    const app = new UserApplicationService({ update } as unknown as UserGateway, new BrowserSessionStore(memory()));
    await expect(app.update({ id: 'u1', name: 'Ana Pérez', email: 'ana@example.com', role: 'MEMBER', status: 'ACTIVE' })).resolves.toMatchObject({ name: 'Ana Pérez' });
    expect(update).toHaveBeenCalledOnce();
  });

  it('lee el formato "campo: mensaje" de un 400 de user-service', () => {
    expect(parseFieldErrors('name: name must have at least 3 characters, password: password must have at least 8 characters, email: email must be a valid email address')).toEqual({
      name: 'name must have at least 3 characters',
      password: 'password must have at least 8 characters',
      email: 'email must be a valid email address',
    });
    expect(parseFieldErrors('Error interno del servidor.')).toEqual({});
    expect(parseFieldErrors(undefined)).toEqual({});
  });

  it('un 400 con errores por campo llega como ApiValidationError y uno sin formato conserva el mensaje general', async () => {
    const client = new HttpClient('/api', new BrowserSessionStore(memory()), vi.fn());
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 400, message: 'email: email must be a valid email address' }), { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 400, message: 'Datos inválidos' }), { status: 400 }));
    await expect(client.request('/users', 'POST', {}, false)).rejects.toMatchObject({ status: 400, fields: { email: 'email must be a valid email address' } });
    const second = client.request('/users', 'POST', {}, false);
    await expect(second).rejects.not.toBeInstanceOf(ApiValidationError);
    await expect(second).rejects.toThrow('Revisa los datos ingresados.');
    fetchMock.mockRestore();
  });
});
