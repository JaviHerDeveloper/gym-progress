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
- Los formularios son estáticos: no consumen API, no gestionan autenticación ni replican las validaciones funcionales del backend.

## Validación local de formularios

- Login y registro muestran feedback solo tras blur o un intento de envío; los campos marcados se recalculan mientras se corrigen.
- Los mensajes propios sustituyen la validación nativa del navegador mediante `noValidate`.
- Los valores visibles se preservan tal como fueron escritos. La normalización de nombre y correo se usa únicamente para validar; las contraseñas nunca se transforman.
- Cada campo conserva una zona estable para helper o error, con asociaciones `aria-invalid` y `aria-describedby` cuando existe feedback renderizado.
