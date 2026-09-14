# Guía para colaboradores automáticos

## Propósito

Este documento recogerá las convenciones de trabajo para agentes y colaboradores del repositorio.

## Principios iniciales

- Mantener la separación entre `apps/web`, `apps/api` y `packages/shared`.
- Organizar el backend por dominio dentro de `apps/api/src/modules`.
- Añadir código compartido solo cuando lo consuman realmente frontend y backend.
- Documentar las decisiones arquitectónicas relevantes en `docs/decisions.md`.
