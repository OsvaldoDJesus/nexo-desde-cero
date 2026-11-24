// Ejercicio 7 de la guía 13: sesión reactiva compartida.
import { describe, it, expect } from 'vitest';
import { computed } from 'vue';
import { UserApplicationService } from '../../src/application/services/UserApplicationService';
import { BrowserSessionStore, SESSION_KEY } from '../../src/adapters/storage/BrowserSessionStore';
import { createSessionState } from '../../src/entrypoint/gui/session-state';
import type { UserGateway } from '../../src/domain/ports/out/UserGateway';

function memory() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear(), key: () => null, get length() { return values.size; } } as Storage;
}

describe('estado de sesión compartido', () => {
  it('los valores derivados cambian con refresh, sin depender de la ruta', async () => {
    const storage = memory();
    const gateway = { login: async () => ({ token: 't1', userId: 'u1', role: 'ADMIN' as const, expiresAt: Date.now() + 60000 }) } as unknown as UserGateway;
    const app = new UserApplicationService(gateway, new BrowserSessionStore(storage));
    const state = createSessionState(app);
    const isAdmin = computed(() => state.current.value?.role === 'ADMIN');
    expect(state.current.value).toBeNull();

    await app.login({ email: 'admin@example.com', password: 'password123' });
    state.refresh();
    expect(isAdmin.value).toBe(true);

    // Otra pestaña guarda una sesión con otro rol: llega el evento storage y se llama refresh.
    storage.setItem(SESSION_KEY, JSON.stringify({ token: 't2', userId: 'u2', role: 'REVIEWER', expiresAt: Date.now() + 60000 }));
    state.refresh();
    expect(state.current.value?.role).toBe('REVIEWER');
    expect(isAdmin.value).toBe(false);

    app.logout();
    state.refresh();
    expect(state.current.value).toBeNull();
  });
});
