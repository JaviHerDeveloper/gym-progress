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

### PostgreSQL y Drizzle ORM para la persistencia inicial

- Estado: aceptada
- Contexto: RF-01 requiere persistir usuarios, su perfil y un historial de peso corporal, sin introducir todavía funcionalidades de autenticación ni API de dominio.
- Decisión: usar PostgreSQL y Drizzle ORM, con la configuración y conexión encapsuladas en `apps/api`. Los schemas residen en `apps/api/src/db/schema` y se mantienen separados de la conexión.

### Identificadores, relaciones y valores temporales del modelo de usuarios

- Estado: aceptada
- Decisión: usar UUID como clave primaria; hacer único `users.email`; modelar `user_profiles.user_id` como relación 1:1 y `body_weight_entries.user_id` como relación 1:N. Ambas claves foráneas eliminan dependientes mediante `ON DELETE CASCADE`.
- Decisión: usar `numeric(5,2)` para altura en centímetros y `numeric(6,2)` para peso en kilogramos. El peso actual se derivará de la medición más reciente, sin duplicarlo en usuarios ni perfiles.
- Decisión: usar `timestamptz` para todos los timestamps relevantes. `measured_at` admite fechas explícitas, incluidas fechas anteriores, y recibe la hora actual por defecto. `updated_at` recibe solo un valor inicial con `defaultNow()`; PostgreSQL no lo actualizará automáticamente y las futuras operaciones de aplicación deberán asignarlo de forma explícita.
