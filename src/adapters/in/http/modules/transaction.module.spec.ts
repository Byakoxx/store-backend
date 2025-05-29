import { Test, TestingModule } from '@nestjs/testing';
import { TransactionModule } from './transaction.module';
import { TransactionsController } from '../controllers/transaction.controller';

describe('TransactionModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TransactionModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have TransactionsController', () => {
    const controller = module.get<TransactionsController>(TransactionsController);
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
}); 