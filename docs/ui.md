# Interfaz visual inicial

## Fundamentos

- La tipografía exclusiva de la aplicación es Sora, empaquetada mediante `@fontsource/sora`.
- La interfaz usa fondo oscuro, superficies elevadas y tokens CSS centralizados para paleta y radios.
- El magenta (`#FF2BD6`) es el acento principal de interacción. El azul (`#00C2FF`) queda reservado como acento secundario y no se alterna entre controles.

## Pantallas de autenticación

- Login y registro reutilizan el mismo layout, campos, CTA y navegación inferior.
- En escritorio el formulario aparece dentro de una card de hasta 420 px; en móvil la card se elimina visualmente y se conserva un margen lateral de 24 px.
- El contenedor usa `min-height: 100dvh` para responder correctamente a navegadores móviles.
- La marca actual es exclusivamente tipográfica: `GYM PROGRESS`.

## Controles

- Inputs: 48 px de alto, labels visibles y asociados semánticamente, foco magenta visible y unidades `cm`/`kg` cuando corresponda.
- El CTA principal es outline magenta; el glow se limita a estados de interacción.
- Los formularios consumen exclusivamente los endpoints de autenticación mediante una capa HTTP centralizada. No leen ni almacenan tokens: la sesión se transporta solo por cookies HttpOnly con `credentials: 'include'`.

## Validación local de formularios

- Login y registro muestran feedback solo tras blur o un intento de envío; los campos marcados se recalculan mientras se corrigen.
- Los mensajes propios sustituyen la validación nativa del navegador mediante `noValidate`.
- Los valores visibles se preservan tal como fueron escritos. La normalización de nombre y correo se usa únicamente para validar; las contraseñas nunca se transforman.
- Cada campo conserva una zona estable para helper o error, con asociaciones `aria-invalid` y `aria-describedby` cuando existe feedback renderizado.

## Estados de autenticación

- Durante la restauración de sesión se muestra un estado de carga accesible en vez de renderizar brevemente contenido protegido o formularios equivocados.
- Un fallo temporal al consultar la sesión muestra un mensaje seguro y una acción para reintentar.
- Los formularios deshabilitan su CTA mientras la solicitud está en curso, muestran errores públicos del servidor y no exponen detalles internos.
- La pantalla temporal `/app` muestra únicamente nombre y correo del usuario autenticado, además de la acción de cierre de sesión.
