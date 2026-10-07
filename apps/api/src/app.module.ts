import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { HealthController } from './health/health.controller';
import { I18nController } from './i18n/i18n.controller';
import { PrismaModule } from './prisma/prisma.module';
import { SeedService } from './seed/seed.service';
import { StaffModule } from './staff/staff.module';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [PrismaModule, AuthModule, CatalogModule, StaffModule, TablesModule],
  controllers: [HealthController, I18nController],
  providers: [SeedService],
})
export class AppModule {}
