# Firestore

## Colecciones

users

organizations

events

ticketTypes

orders

tickets

payments

venues

categories

checkins

notifications

settings

---

## Relaciones

Una organización tiene muchos eventos.

Un evento tiene muchos tipos de entrada.

Una orden puede contener múltiples entradas.

Cada ticket pertenece únicamente a un comprador.

Cada ticket posee un QR único.

---

## Estados

Evento

draft

published

finished

cancelled

Orden

pending

paid

cancelled

expired

refunded

Ticket

active

used

cancelled

transferred