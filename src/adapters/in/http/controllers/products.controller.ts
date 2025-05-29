import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ProductService } from 'src/application/ports-in/product-service-interface';
import { Product } from 'src/domain/models/product.entity';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('ProductService')
    private readonly productService: ProductService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<Product[]> {
    return this.productService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  async findById(@Param('id') id: string): Promise<Product | null> {
    return this.productService.getById(id);
  }
}
