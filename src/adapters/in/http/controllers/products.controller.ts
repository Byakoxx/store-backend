import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from '../../../../application/ports-in/product-service-interface';
import { toProductResponseDto } from '../../../../shared/dto/product-mapper';
import { ProductResponseDto } from '../../../../shared/dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('ProductService')
    private readonly productService: ProductService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productService.getAll();
    return products.map(toProductResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id') id: string): Promise<ProductResponseDto | null> {
    const product = await this.productService.getById(id);
    return product ? toProductResponseDto(product) : null;
  }
}
