import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isDeleted: false, isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });
  }
}
