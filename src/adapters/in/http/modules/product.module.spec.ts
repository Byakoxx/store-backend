import { Test, TestingModule } from '@nestjs/testing';
import { ProductModule } from './product.module';
import { ProductsController } from '../controllers/products.controller';

describe('ProductModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ProductsController', () => {
    const controller = module.get<ProductsController>(ProductsController);
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
}); 