# Gym Progress

Aplicación web/PWA para registrar y consultar el progreso de entrenamiento en gimnasio.

## Estructura

- `apps/web`: cliente React creado con Vite.
- `apps/api`: API REST con Express.
- `packages/shared`: contratos o validaciones que deban compartirse; debe mantenerse mínimo.
- `docs`: requisitos, arquitectura y decisiones técnicas.

## Requisitos

- Node.js 22 o superior
- npm 11 o superior

## Instalación

```bash
npm install
```

Copie los archivos `.env.example` de cada aplicación a `.env` cuando se necesiten variables de entorno.

## Desarrollo

```bash
npm run dev:web
npm run dev:api
```

## Validación

```bash
npm run typecheck
npm run build
```

La documentación inicial se encuentra en [`docs/`](docs/).
