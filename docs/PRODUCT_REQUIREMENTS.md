# Requerimientos del Producto

Objetivo

Construir una plataforma SaaS para venta de entradas.

Modelo

Multiempresa.

Cada organizador administra únicamente sus eventos.

Compra

El cliente puede comprar sin crear cuenta.

Después podrá activar una cuenta usando el mismo correo.

Roles

Super Admin

Organizador

Staff

Cliente

Eventos

Un evento puede tener múltiples tipos de entrada.

Entradas

General

VIP

Backstage

Mesa

Preventa

etc.

QR

Cada ticket posee un QR único.

El QR solo puede utilizarse una vez.

Seguridad

Nunca marcar un ticket como pagado desde el frontend.

Los pagos deben validarse desde Cloud Functions o Backend.

Diseño

Mantener la identidad visual existente.

No rehacer el frontend.

Toda nueva funcionalidad deberá integrarse con el diseño actual.