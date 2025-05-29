import { Module } from '@nestjs/common';
import { ProductsController } from '../controllers/products.controller';
import { ProductServiceImpl } from 'src/application/services/product.service';
import { ProductPrismaRepository } from 'src/adapters/out/persistence/repositories/product.repository';

@Module({
  imports: [ProductModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: 'ProductRepository',
      useClass: ProductPrismaRepository,
    },
    {
      provide: 'ProductService',
      useClass: ProductServiceImpl,
    },
  ],
  exports: ['ProductService'],
})
export class ProductModule {}
