import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@postrestoran/shared';
import { PrismaService } from '../prisma/prisma.service';

const ROLE_MAP: Record<string, UserRole> = {
  OWNER: UserRole.OWNER,
  MANAGER: UserRole.MANAGER,
  CASHIER: UserRole.CASHIER,
  WAITER: UserRole.WAITER,
  KITCHEN: UserRole.KITCHEN,
};

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        shift: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    tenantId: string,
    body: {
      email?: string;
      fullName?: string;
      password?: string;
      role?: string;
      shift?: string;
    },
  ) {
    const email = (body.email || '').trim().toLowerCase();
    const fullName = (body.fullName || '').trim();
    const password = body.password || '';
    const roleKey = (body.role || 'WAITER').toUpperCase();
    const role = ROLE_MAP[roleKey];

    if (!email || !fullName || !password || !role) {
      throw new BadRequestException('email, fullName, password and role are required');
    }

    const hashed = await bcrypt.hash(password, 10);
    const shiftRaw = (body.shift || 'FULL_DAY').toUpperCase().replace(' ', '_');
    const shift =
      shiftRaw === 'MORNING' || shiftRaw === 'EVENING' || shiftRaw === 'FULL_DAY'
        ? shiftRaw
        : 'FULL_DAY';

    return this.prisma.user.create({
      data: {
        email,
        fullName,
        password: hashed,
        role,
        shift: shift as 'MORNING' | 'EVENING' | 'FULL_DAY',
        tenantId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        shift: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
