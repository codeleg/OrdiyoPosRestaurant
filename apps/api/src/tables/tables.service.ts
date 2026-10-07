import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.restaurantTable.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        zone: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
