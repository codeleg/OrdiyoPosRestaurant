import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_TENANT_SLUG,
  UserRole,
} from '@postrestoran/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDemoData();
  }

  private async ensureDemoData() {
    let tenant = await this.prisma.tenant.findUnique({
      where: { slug: DEMO_TENANT_SLUG },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: 'Demo Restaurant',
          slug: DEMO_TENANT_SLUG,
          region: 'TR',
          defaultCurrency: 'TRY',
        },
      });
      this.logger.log(`Created demo tenant ${tenant.slug}`);
    }

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: DEMO_ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const password = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
      await this.prisma.user.create({
        data: {
          email: DEMO_ADMIN_EMAIL,
          password,
          fullName: 'Demo Admin',
          role: UserRole.OWNER,
          tenantId: tenant.id,
          username: 'admin',
        },
      });
      this.logger.log(`Created demo admin ${DEMO_ADMIN_EMAIL}`);
    }

    let zone = await this.prisma.zone.findFirst({
      where: { tenantId: tenant.id, isDeleted: false },
    });
    if (!zone) {
      zone = await this.prisma.zone.create({
        data: { name: 'Salon', tenantId: tenant.id },
      });
    }

    const tableCount = await this.prisma.restaurantTable.count({
      where: { tenantId: tenant.id, isDeleted: false },
    });
    if (tableCount === 0) {
      await this.prisma.restaurantTable.create({
        data: {
          name: 'Masa 1',
          tenantId: tenant.id,
          zoneId: zone.id,
          capacity: 4,
          status: 'AVAILABLE',
        },
      });
    }

    let category = await this.prisma.category.findFirst({
      where: { tenantId: tenant.id, isDeleted: false },
    });
    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: 'İçecekler',
          tenantId: tenant.id,
          sortOrder: 1,
        },
      });
    }

    const productCount = await this.prisma.product.count({
      where: { tenantId: tenant.id, isDeleted: false },
    });
    if (productCount === 0) {
      await this.prisma.product.create({
        data: {
          name: 'Çay',
          description: 'Demlik çay',
          price: 25,
          tenantId: tenant.id,
          categoryId: category.id,
          isStockTracked: false,
        },
      });
    }

    const lang = await this.prisma.supportedLanguage.findUnique({
      where: { code: 'tr' },
    });
    if (!lang) {
      await this.prisma.supportedLanguage.create({
        data: {
          code: 'tr',
          name: 'Türkçe',
          direction: 'ltr',
          isDefault: true,
          isActive: true,
        },
      });
    }
  }
}
