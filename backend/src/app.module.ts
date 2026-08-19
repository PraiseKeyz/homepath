import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { TrustLayerModule } from './trust-layer/trust-layer.module.js';
import { CooperativesModule } from './cooperatives/cooperatives.module.js';
import { NeighbourhoodModule } from './neighbourhood/neighbourhood.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    TrustLayerModule,
    CooperativesModule,
    NeighbourhoodModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // 1st — populates request.user
    { provide: APP_GUARD, useClass: RolesGuard }, // 2nd — checks @Roles()
  ],
})
export class AppModule {}
