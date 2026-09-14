## RF-01 — Gestión de usuarios, perfil y peso corporal

### Registro de usuario

- USR-01: El usuario podrá crear una cuenta.
- USR-02: El registro solicitará nombre, correo electrónico, contraseña, altura y peso corporal inicial.
- USR-03: El correo electrónico deberá ser único.
- USR-04: El correo se normalizará antes de almacenarse para evitar duplicados por diferencias entre mayúsculas y minúsculas.
- USR-05: La contraseña deberá tener un mínimo de 8 caracteres.
- USR-06: La contraseña nunca deberá almacenarse en texto plano.
- USR-07: La altura se almacenará internamente en centímetros.
- USR-08: El peso se almacenará internamente en kilogramos.
- USR-09: El peso ingresado durante el registro creará la primera medición del historial de peso del usuario.

### Autenticación

- USR-10: El usuario podrá iniciar sesión mediante correo electrónico y contraseña.
- USR-11: La sesión deberá permanecer iniciada al cerrar y volver a abrir la aplicación.
- USR-12: El usuario podrá cerrar sesión manualmente.
- USR-13: Cada usuario solamente podrá consultar y modificar sus propios datos.
- USR-14: Los errores de autenticación no deberán revelar información sensible sobre las cuentas existentes.

### Perfil

- USR-15: El usuario podrá consultar su perfil.
- USR-16: El usuario podrá modificar su nombre.
- USR-17: El usuario podrá modificar su altura.
- USR-18: El correo electrónico no será editable en la primera versión.
- USR-19: La contraseña no será editable en la primera versión.

### Peso corporal

- USR-20: El peso corporal se manejará como un historial de mediciones y no como un atributo editable directamente en el perfil.
- USR-21: Registrar un nuevo peso deberá crear una nueva medición sin sobrescribir las anteriores.
- USR-22: El peso corporal actual será la medición cronológicamente más reciente.
- USR-23: Cada medición deberá almacenar como mínimo el peso y la fecha de medición.
- USR-24: El usuario podrá registrar una medición correspondiente a una fecha anterior.
- USR-25: El usuario podrá editar una medición existente para corregir errores.
- USR-26: El usuario podrá eliminar una medición existente.
- USR-27: Editar o eliminar una medición no deberá modificar las demás entradas del historial.

### Fuera del alcance de esta versión

Por ahora no se implementarán:

- recuperación de contraseña;
- cambio de contraseña;
- cambio de correo electrónico;
- verificación por correo electrónico;
- inicio de sesión con Google;
- inicio de sesión con Apple;
- fotografía de perfil;
- eliminación de cuenta;
- roles administrativos;
- gráficas de evolución del peso.

### Registro y sesión inicial

- USR-28: Al completar correctamente el registro, el usuario deberá quedar autenticado automáticamente.
- USR-29: El usuario no deberá ser redirigido nuevamente a la pantalla de login después de registrarse.
- USR-30: La creación del usuario, perfil y primera medición de peso deberá realizarse de forma atómica.
- USR-31: Si falla cualquiera de las operaciones necesarias para crear la cuenta, no deberá persistirse información parcial.
- USR-32: El correo electrónico deberá normalizarse mediante trim y conversión a minúsculas antes de persistirse.
- USR-33: La contraseña deberá almacenarse únicamente mediante un hash seguro.

### Persistencia de sesión

- USR-34: Después de registrarse correctamente, el usuario deberá quedar autenticado automáticamente.
- USR-35: La autenticación deberá persistir aunque el usuario cierre y vuelva a abrir la PWA.
- USR-36: La sesión inicial tendrá una vigencia de 90 días.
- USR-37: El usuario podrá cerrar su sesión actual manualmente.
- USR-38: Cerrar sesión deberá invalidar la sesión correspondiente en el servidor.
- USR-39: La aplicación podrá soportar varias sesiones simultáneas para un mismo usuario.
- USR-40: La creación inicial de la cuenta y de su primera sesión de autenticación deberá ser atómica. Si no es posible crear la sesión inicial, tampoco deberán persistirse el usuario, perfil ni primera medición de peso.

### Registro HTTP y cookie de sesión

- USR-41: El registro deberá estar disponible mediante un endpoint HTTP de la API.
- USR-42: Cuando el registro termine correctamente, la API deberá responder con estado HTTP 201.
- USR-43: La sesión creada durante el registro deberá entregarse al navegador mediante una cookie HttpOnly.
- USR-44: El token de sesión nunca deberá incluirse en el cuerpo JSON de una respuesta.
- USR-45: La cookie de sesión deberá utilizar SameSite=Lax y Path=/.
- USR-46: La cookie deberá utilizar Secure en entornos de producción.
- USR-47: La expiración de la cookie deberá coincidir con la expiración de la sesión almacenada en el servidor.
- USR-48: Un intento de registro con un correo ya existente deberá responder con HTTP 409.
- USR-49: Un payload de registro inválido deberá responder con HTTP 400.
- USR-50: Los errores inesperados deberán responder con HTTP 500 sin exponer detalles internos.

### Validación de sesión

- USR-51: El sistema deberá poder validar una sesión a partir del token recibido del cliente.
- USR-52: El token original nunca deberá buscarse ni almacenarse directamente; deberá transformarse mediante SHA-256 antes de consultar la base de datos.
- USR-53: Una sesión solamente será válida si existe en `auth_sessions` y su fecha de expiración es posterior al momento actual.
- USR-54: Una sesión inexistente o expirada deberá considerarse no autenticada.
- USR-55: La validación de una sesión válida deberá permitir obtener los datos seguros del usuario asociado.
- USR-56: La validación nunca deberá exponer `password_hash`, `token_hash` ni otros datos internos de autenticación.