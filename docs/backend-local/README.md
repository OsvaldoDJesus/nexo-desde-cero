# Backend real en local (user-service con Docker)

Así se levantó el backend Java del instructor para probar Nexo contra un servidor real en lugar de la simulación de Postman.

## Qué necesita user-service

- **JDK 17:** el `pom.xml` exige 17 con maven-toolchains. Con Docker no hace falta instalarlo, porque la imagen compila con `maven:3.9.11-eclipse-temurin-17`.
- **MySQL 8.4:** el `compose.yaml` del proyecto lo crea y ejecuta `schema.sql`, que también inserta un administrador activo de prueba.
- **RabbitMQ:** cada creación, edición y borrado publica un evento en el exchange `domain.events` con `mandatory=true` y espera confirmación. Si el exchange no existe, o si ninguna cola recibe el mensaje, la operación falla con **503 "No se pudo publicar el evento de dominio."**. El `compose.yaml` original no trae RabbitMQ, por eso se agregó [compose.local.yaml](compose.local.yaml).

## Pasos

```powershell
git clone https://github.com/arrietajohn/user-service.git
cd user-service
# copiar aquí docs/backend-local/compose.local.yaml de este repositorio
docker compose -p nexo-backend -f compose.yaml -f compose.local.yaml up -d mysql rabbitmq
docker compose -p nexo-backend -f compose.yaml -f compose.local.yaml build api
```

Crear el exchange y una cola que reciba todos los eventos (API de administración de RabbitMQ, puerto 15672):

```bash
U=nexo_local:nexo_local_password; R=http://localhost:15672/api
curl -u $U -X PUT  $R/exchanges/%2F/domain.events -H "content-type: application/json" -d '{"type":"topic","durable":true}'
curl -u $U -X PUT  $R/queues/%2F/taller.domain-events -H "content-type: application/json" -d '{"durable":true}'
curl -u $U -X POST $R/bindings/%2F/e/domain.events/q/taller.domain-events -H "content-type: application/json" -d '{"routing_key":"#"}'
```

Arrancar la API y el frontend:

```powershell
docker compose -p nexo-backend -f compose.yaml -f compose.local.yaml up -d api
cd ..\nexo-desde-cero
npm run dev
```

Sin `.env`, Vite reenvía `/api` a `http://localhost:8080`, que es la API. El usuario inicial es el administrador que inserta `schema.sql` de user-service (correo y contraseña en ese archivo).

## Comprobaciones útiles

```bash
# Filas guardadas (la contraseña se guarda con bcrypt)
docker exec nexo-backend-mysql-1 mysql -uusers_app -plocal_users_password crud_usuarios -e "SELECT id, name, email, role, status FROM users;"
# Eventos publicados por el backend
curl -s -u nexo_local:nexo_local_password -X POST http://localhost:15672/api/queues/%2F/taller.domain-events/get -H "content-type: application/json" -d '{"count":10,"ackmode":"ack_requeue_true","encoding":"auto"}'
```

Para apagar todo: `docker compose -p nexo-backend -f compose.yaml -f compose.local.yaml down` (agrega `-v` para borrar también los datos de MySQL).
