# Nexo desde cero · Taller Vue 3 + TypeScript

Reconstrucción paso a paso de **Nexo · Administración de usuarios**, la aplicación Vue 3 + TypeScript con arquitectura hexagonal del instructor John Carlos Arrieta Arrieta ([proyecto original](https://github.com/arrietajohn/user-crud-vuejs-app), licencia MIT), siguiendo sus 14 guías.

- **[docs/TALLER.md](docs/TALLER.md):** respuestas de cada guía, prácticas, ejercicios y capturas de evidencia.
- **Rama `main`:** el proyecto reconstruido desde una carpeta vacía, con un commit por guía.
- **Rama `ejercicios`:** las prácticas que las guías piden hacer en una copia (guías 02, 09, 11 y 13).

## Requisitos

- Node.js 22.12 o superior (las guías recomiendan Node 26 LTS).
- Para las pruebas de navegador: [Postman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-installation/) 1.70 o superior y el Chromium de Playwright.

## Ejecutar

```bash
npm ci
npm run dev
```

Por defecto Vite reenvía `/api` a `http://localhost:8080`. Para usar otro backend crea un `.env` a partir de [.env.example](.env.example).

### Con la simulación local (sin backend)

En una terminal:

```bash
postman simulation run postman/simulations/users/users.sim.yaml --port 4010 --no-history
```

En otra (PowerShell):

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:4010/user-service'; npm run dev
```

Abre `http://localhost:5173` e inicia sesión con `admin@example.com` / `password123`. Esas credenciales solo existen en la simulación.

## Verificar

```bash
npm test                          # 8 pruebas unitarias
npm run build                     # tipos + compilación
npx playwright install chromium   # una vez
npm run test:e2e                  # 4 escenarios; puertos 5173 y 4010 libres
```

## Arquitectura

```text
src/
├── domain/            Reglas: constantes, errores, objetos de valor, modelos y puertos de salida
├── application/       Casos de uso: DTO, mapper, puertos de entrada y servicio
├── adapters/          HTTP (fetch + Bearer) y sesión en localStorage
├── bootstrap/         Composición de dependencias
└── entrypoint/gui/    Vue: router, App, vistas, contexto y estilos
```

El dominio y la aplicación no importan Vue ni conocen `fetch` o `localStorage`.
