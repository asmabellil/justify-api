import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JustifyModule } from './justify/justify.module';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [AuthModule, JustifyModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }