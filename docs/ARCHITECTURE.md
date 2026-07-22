# TicketS - Arquitectura

## Objetivo

TicketS es una plataforma SaaS para la creación, administración y comercialización de eventos.

La plataforma permitirá que múltiples organizadores administren sus eventos desde una misma aplicación.

El sistema será multiempresa (multi-tenant).

---

## Tecnologías

Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- React Router
- Firebase SDK

Backend (Fase posterior)

- NestJS

Servicios

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions
- MercadoPago

Hosting

- Vercel

---

## Arquitectura General

Frontend

↓

Firebase Authentication

↓

Cloud Firestore

↓

Firebase Storage

↓

Cloud Functions (cuando sea necesario)

---

## Roles

Super Admin

Organizador

Staff

Cliente

---

## Principios

- Código limpio.
- Componentes reutilizables.
- Arquitectura modular.
- Mobile First.
- No duplicar lógica.
- Mantener identidad visual.
- No romper funcionalidades existentes.

---

## Flujo General

Organizador

↓

Crea evento

↓

Publica evento

↓

Cliente compra

↓

Pago aprobado

↓

Se genera ticket

↓

Se genera QR

↓

Check-in