import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryModule } from './delivery.module';

describe('DeliveryModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DeliveryModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
}); 