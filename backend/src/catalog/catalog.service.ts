import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogItem } from '../entities/catalog-item.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CatalogItem) private readonly repo: Repository<CatalogItem>,
  ) {}

  list(type?: string) {
    const where = type ? { type } : {};
    return this.repo.find({ where });
  }

  create(type: string, name: string) {
    const item = this.repo.create({ type, name });
    return this.repo.save(item);
  }
}
