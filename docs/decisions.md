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

### Registro interno con Argon2id y transacción de persistencia

- Estado: aceptada
- Contexto: el registro debe crear de forma atómica un usuario, su perfil y la primera medición de peso, sin exponer todavía una interfaz HTTP.
- Decisión: validar y normalizar los datos de entrada con Zod y hashear la contraseña mediante Argon2id antes de abrir la transacción de PostgreSQL. Los parámetros se centralizan junto al servicio para permitir su ajuste posterior.
- Decisión: el repositorio de registro usa `db.transaction()` exclusivamente para las inserciones de `users`, `user_profiles` y `body_weight_entries`; esto garantiza rollback real ante cualquier error de persistencia. Las pruebas unitarias verifican la atomicidad lógica mediante dependencias inyectables; una prueba de integración de rollback contra PostgreSQL podrá añadirse posteriormente.
- Decisión: solo una violación PostgreSQL `23505` de la constraint `users_email_unique` se traduce al error de dominio de correo duplicado.

### Persistencia de sesiones de autenticación

- Estado: aceptada
- Contexto: la autenticación persistente requiere soportar varias sesiones por usuario y permitir su invalidación posterior, sin almacenar credenciales de sesión en texto plano.
- Decisión: usar `auth_sessions` con UUID como clave primaria, relación 1:N hacia `users` y `ON DELETE CASCADE`. Cada sesión tiene expiración explícita, sin `updated_at`, y se indexa por usuario y por expiración.
- Decisión: el token original nunca se persistirá. Se almacena exclusivamente `SHA-256(token)` codificado como hexadecimal; por ello `token_hash` tiene una longitud lógica fija de 64 caracteres. El servicio interno usa `randomBytes(32)` y `createHash('sha256')` de `node:crypto`, con una vigencia fija centralizada de 90 días.

### Registro inicial atómico con sesión

- Estado: aceptada
- Contexto: USR-40 exige que la cuenta, el perfil, la primera medición y la primera sesión no puedan quedar persistidos de forma parcial.
- Decisión: validar, hashear la contraseña y preparar la sesión antes de abrir la transacción. Una única transacción de PostgreSQL comparte el mismo executor para insertar `users`, `user_profiles`, `body_weight_entries` y `auth_sessions`; solo el hash del token llega a la persistencia.

### Registro HTTP y entrega de sesión por cookie

- Estado: aceptada
- Decisión: exponer el registro mediante `POST /api/auth/register`, reutilizando exclusivamente el caso de uso de registro completo. El token se entrega solo en la cookie `gp_session`, configurada como HttpOnly, SameSite=Lax, Path=/, con la expiración de la sesión y Secure únicamente en producción.
- Decisión: CORS permite exclusivamente el origen configurado mediante `CORS_ORIGIN` y habilita credenciales. La configuración de entorno se resuelve en el arranque de la API y se inyecta explícitamente en el factory de Express.

### Validación interna de sesiones

- Estado: aceptada
- Decisión: la validación transforma el token recibido mediante la misma función SHA-256 usada al crear sesiones y consulta únicamente su hash. Una sesión es válida solo cuando existe y `expires_at > now`; sesiones expiradas no se eliminan automáticamente en esta iteración.
