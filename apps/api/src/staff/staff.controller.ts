import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  @Get()
  list(@Req() req: { user: { tenantId: string } }) {
    return this.staff.list(req.user.tenantId);
  }

  @Post()
  create(
    @Req() req: { user: { tenantId: string } },
    @Body()
    body: {
      email?: string;
      fullName?: string;
      password?: string;
      role?: string;
      shift?: string;
    },
  ) {
    return this.staff.create(req.user.tenantId, body);
  }
}
