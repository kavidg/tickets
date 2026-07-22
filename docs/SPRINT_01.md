# Sprint 01 - Fundación de Autenticación y Seguridad

## Objetivo

Implementar la base de autenticación y seguridad del proyecto TicketS utilizando Firebase Authentication.

Al finalizar este sprint, la aplicación debe tener:

- Sistema de autenticación funcional.
- Manejo global del usuario autenticado.
- Protección de rutas privadas.
- Persistencia de sesión.
- Estructura preparada para roles y permisos.
- Integración inicial con Firebase.

---

# Alcance

Este sprint incluye únicamente:

- Configuración Firebase.
- Firebase Authentication.
- Auth Service.
- Auth Context.
- Protected Routes.
- Manejo de sesión.
- Logout.
- Registro.
- Login.
- Recuperación de contraseña.

---

# Fuera del alcance

No implementar todavía:

- Eventos.
- Tickets.
- Pagos.
- Firestore avanzado.
- Dashboard administrativo.
- Roles completos.
- Organizaciones.

Estos módulos pertenecen a futuros sprints.

---

# Arquitectura requerida

La implementación debe respetar la arquitectura:

Usuario

↓

Componente React

↓

Hook

↓

Service

↓

Firebase


Los componentes visuales no deben comunicarse directamente con Firebase.

---

# Estructura esperada

Crear o utilizar:

src/

firebase/

services/

contexts/

hooks/

routes/

features/auth/

types/

---

# Firebase

Configurar:

- Firebase App.
- Firebase Authentication.
- Persistencia de sesión.

Métodos iniciales:

- Email/password.

No agregar:

- Google Login.
- Redes sociales.

---

# Auth Service

Debe contener funciones:

- registerUser()
- loginUser()
- logoutUser()
- resetPassword()
- getCurrentUser()

---

# Auth Context

Debe manejar:

Estado:

- user
- loading
- authenticated


Funciones:

- login
- register
- logout
- resetPassword


Debe escuchar cambios de sesión mediante Firebase Auth Listener.

---

# Rutas protegidas

Crear sistema para proteger páginas privadas.

Comportamiento:

Usuario no autenticado:

↓

Redirigir a login.


Usuario autenticado:

↓

Permitir acceso.

---

# Requisitos de seguridad

- No almacenar contraseñas manualmente.
- No guardar tokens en localStorage.
- Utilizar Firebase Authentication.
- Mantener separación entre UI y lógica.
- No exponer configuración sensible.

---

# Criterios de aceptación

## Login

Debe permitir:

✔ Iniciar sesión.

✔ Mostrar errores.

✔ Mantener sesión.


## Registro

Debe permitir:

✔ Crear usuario.

✔ Validar errores.


## Logout

Debe:

✔ Cerrar sesión.

✔ Limpiar estado global.


## Protección

Debe:

✔ Bloquear rutas privadas.

✔ Permitir rutas públicas.


---

# Reglas para Codex

Antes de modificar código:

1. Leer toda la carpeta docs.
2. Analizar la arquitectura existente.
3. Mantener el diseño actual.
4. No eliminar componentes.
5. No reorganizar carpetas sin autorización.
6. Explicar archivos que modificará.
7. Implementar solamente este sprint.
8. No agregar funcionalidades futuras.
