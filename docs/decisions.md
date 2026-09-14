# Decisiones arquitectónicas

## Propósito

Este documento conservará decisiones técnicas junto con su contexto y justificación.

## Decisiones iniciales

### Monorepo ligero con npm workspaces

- Estado: aceptada
- Contexto: frontend y backend evolucionarán juntos durante la primera etapa.
- Decisión: usar `apps/web`, `apps/api` y `packages/shared`.

### API REST organizada por dominio

- Estado: aceptada
- Decisión: las rutas, controllers, services y schemas de cada dominio vivirán en `apps/api/src/modules/<dominio>`.
