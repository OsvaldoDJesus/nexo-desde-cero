import type { UseCases } from '../ports/in/use-cases';
import type { UserGateway } from '../../domain/ports/out/UserGateway';
import type { SessionStore } from '../../domain/ports/out/SessionStore';
import type { LoginCommand, CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../dto/commands/user-commands';
import type { GetUserQuery, ListUsersQuery } from '../dto/queries/user-queries';
import { User } from '../../domain/model/User';
import { UserEmail, UserId, UserName, UserPassword } from '../../domain/valueobjects/user-values';
import { DomainError, ValidationError, type FieldErrors } from '../../domain/exceptions/errors';
import { toUserResponse } from '../mapper/UserMapper';

// Ejercicio 6 de la guía 13: ejecuta cada regla del dominio y junta los errores por campo,
// para que la pantalla pueda mostrarlos todos a la vez en lugar de solo el primero.
function validateFields(...checks: Array<() => unknown>) {
  const fields: FieldErrors = {};
  for (const check of checks) {
    try { check(); } catch (error) {
      if (error instanceof DomainError && error.field) fields[error.field] ??= error.message; else throw error;
    }
  }
  if (Object.keys(fields).length) throw new ValidationError(fields);
}

export class UserApplicationService implements UseCases {
  constructor(private readonly gateway: UserGateway, private readonly sessions: SessionStore) {}
  async login(command: LoginCommand) {
    validateFields(
      () => new UserEmail(command.email),
      () => { if (!command.password.trim()) throw new DomainError('Ingresa tu contraseña.', 'password'); },
    );
    const email = new UserEmail(command.email).value;
    const session = await this.gateway.login(email, command.password);
    this.sessions.save(session);
    return { userId: session.userId, role: session.role, expiresAt: session.expiresAt };
  }
  currentSession() {
    const session = this.sessions.get();
    if (!session) return null;
    return { userId: session.userId, role: session.role, expiresAt: session.expiresAt };
  }
  logout() { this.sessions.clear(); }
  async create(c: CreateUserCommand) {
    validateFields(() => new UserId(c.id), () => new UserName(c.name), () => new UserEmail(c.email), () => new UserPassword(c.password));
    const user = new User(c.id, c.name, c.email, c.role, 'PENDING');
    return toUserResponse(await this.gateway.create(user, new UserPassword(c.password).value));
  }
  async list(query: ListUsersQuery = {}) {
    const users = (await this.gateway.list()).map(toUserResponse);
    const search = query.search?.trim().toLowerCase();
    return search ? users.filter(u => `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(search)) : users;
  }
  async get(q: GetUserQuery) { return toUserResponse(await this.gateway.get(new UserId(q.id).value)); }
  async update(c: UpdateUserCommand) {
    validateFields(() => new UserId(c.id), () => new UserName(c.name), () => new UserEmail(c.email), () => c.password && new UserPassword(c.password));
    const user = new User(c.id, c.name, c.email, c.role, c.status);
    return toUserResponse(await this.gateway.update(user, c.password ? new UserPassword(c.password).value : undefined));
  }
  delete(c: DeleteUserCommand) { return this.gateway.delete(new UserId(c.id).value); }
}
