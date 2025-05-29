import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from 'src/application/ports-in/product-service-interface';
import { Product } from 'src/domain/models/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.getAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Product | null> {
    return this.productService.getById(id);
  }
}
