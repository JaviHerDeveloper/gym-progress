# Arquitectura

## Propósito

Este documento describirá la arquitectura, los límites entre aplicaciones y las convenciones técnicas.

## Estado inicial

El repositorio usa npm workspaces con un cliente React/Vite en `apps/web`, una API REST Express en `apps/api` y un paquete compartido mínimo en `packages/shared`.

## Persistencia

La persistencia de la API reside exclusivamente en `apps/api` y usa PostgreSQL con Drizzle ORM. La configuración de Drizzle se encuentra en `apps/api/drizzle.config.ts`; la conexión se mantiene separada en `apps/api/src/db/index.ts` y los schemas se exportan desde `apps/api/src/db/schema/index.ts`.

El modelo inicial comprende:

- `users`: identidad persistida del usuario, con UUID como clave primaria y correo único.
- `user_profiles`: perfil 1:1 con `users`, identificado por `user_id` único y eliminado en cascada junto con su usuario.
- `body_weight_entries`: historial 1:N de peso corporal. Cada entrada conserva peso y fecha/hora de medición, incluso cuando corresponde a una fecha anterior. Un índice compuesto en `(user_id, measured_at)` respalda las consultas cronológicas por usuario.

Los timestamps usan `timestamptz`. `created_at`, `updated_at` y `measured_at` tienen un valor inicial de la hora actual; las futuras operaciones de aplicación deberán establecer `updated_at` explícitamente al modificar una fila. El peso actual se deriva del historial y no se duplica en otra tabla.
