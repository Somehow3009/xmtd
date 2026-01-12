import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogItem } from '../entities/catalog-item.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @Roles('DVKH', 'NPP')
  list(@Query('type') type?: string): Promise<CatalogItem[]> {
    return this.catalogService.list(type);
  }

  @Post()
  @Roles('DVKH')
  create(@Body() body: { type: string; name: string }) {
    return this.catalogService.create(body.type, body.name);
  }
}
