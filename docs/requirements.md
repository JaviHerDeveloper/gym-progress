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