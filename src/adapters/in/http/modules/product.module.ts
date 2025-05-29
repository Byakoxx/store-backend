import { Module } from '@nestjs/common';
import { ProductsController } from '../controllers/products.controller';
import { ProductServiceImpl } from 'src/application/services/product.service';
import { ProductPrismaRepository } from 'src/adapters/out/persistence/repositories/product.repository';
import { PrismaModule } from 'src/adapters/out/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
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
