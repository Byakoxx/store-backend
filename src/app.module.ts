import { Module } from '@nestjs/common';
import { ProductModule } from './adapters/in/http/modules/product.module';

@Module({
  imports: [ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
