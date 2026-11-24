// Ejercicio 7 de la guía 13: sesión reactiva compartida.
// Vive en la frontera de la GUI: el dominio y la aplicación no cambian. Todas las vistas leen la misma
// referencia, así que el rol se actualiza en pantalla sin esperar un cambio de ruta.
import { computed, inject, shallowRef, type ComputedRef, type InjectionKey } from 'vue';
import type { SessionUseCase } from '../../application/ports/in/use-cases';
import type { SessionResponse } from '../../application/dto/responses/user-responses';

export interface SessionState {
  readonly current: ComputedRef<SessionResponse | null>;
  refresh(): void;
}

export const SESSION_STATE: InjectionKey<SessionState> = Symbol('session-state');

export function createSessionState(app: Pick<SessionUseCase, 'currentSession'>): SessionState {
  const current = shallowRef(app.currentSession());
  return {
    current: computed(() => current.value),
    refresh: () => { current.value = app.currentSession(); },
  };
}

export function useSession() {
  const state = inject(SESSION_STATE);
  if (!state) throw new Error('Falta configurar el estado de sesión.');
  return state;
}
