import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from 'src/application/ports-in/product-service-interface';
import { toProductResponseDto } from 'src/shared/dto/product-mapper';
import { ProductResponseDto } from 'src/shared/dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('ProductService')
    private readonly productService: ProductService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productService.getAll();
    return products.map(toProductResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findById(@Param('id') id: string): Promise<ProductResponseDto | null> {
    const product = await this.productService.getById(id);
    return product ? toProductResponseDto(product) : null;
  }
}
