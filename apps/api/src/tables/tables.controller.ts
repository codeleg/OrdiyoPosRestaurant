import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TablesService } from './tables.service';

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
  constructor(private readonly tables: TablesService) {}

  @Get()
  list(@Req() req: { user: { tenantId: string } }) {
    return this.tables.list(req.user.tenantId);
  }
}
