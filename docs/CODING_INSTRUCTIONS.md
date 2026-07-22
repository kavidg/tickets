siempre analizar el proyecto antes de modificarlo;
leer primero toda la carpeta docs/;
no cambiar el diseño existente;
reutilizar componentes;
explicar los archivos que modificará antes de escribir código;
no eliminar funcionalidades sin autorización.

## Arquitectura

Los componentes visuales no deben comunicarse directamente con Firebase.

Toda interacción con Authentication, Firestore o Storage debe hacerse mediante la capa Services.

Los Hooks consumirán los Services.

Los Context administrarán el estado global.

Los componentes únicamente renderizarán la interfaz y responderán a eventos del usuario.