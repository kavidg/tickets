/**
 * TicketS - AppModule (Root)
 *
 * Módulo raíz de la aplicación NestJS.
 * Importa y configura todos los módulos globales y funcionales.
 *
 * Arquitectura:
 *   AppModule
 *   ├── ConfigModule        → Variables de entorno (.env)
 *   ├── FirebaseAdminModule → Firebase Admin SDK
 *   ├── CommonModule        → Filtros, interceptors, guards globales
 *   └── HealthModule        → Endpoint de salud
 *
 * @see docs/ARCHITECTURE.md para la documentación completa.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { FirebaseAdminModule } from './firebase/firebase.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { EventsModule } from './modules/events/events.module';
import { VenuesModule } from './modules/venues/venues.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TicketTypesModule } from './modules/ticket-types/ticket-types.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProfileModule } from './modules/profile/profile.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule,
    FirebaseAdminModule,
    CommonModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    EventsModule,
    VenuesModule,
    CategoriesModule,
    TicketTypesModule,
    PurchasesModule,
    InventoryModule,
    CheckoutModule,
    WebhooksModule,
    TicketsModule,
    CheckInModule,
    DashboardModule,
    ProfileModule,
    EmailModule,
  ],
})
export class AppModule {}
