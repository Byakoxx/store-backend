import { Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/domain/models/customer.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { Transaction } from 'src/domain/models/transaction.entity';
import { CustomerRepository } from 'src/domain/ports-out/customer.repository';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { CreateTransactionDto } from 'src/shared/dto/create-transaction.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    let customer = await this.customerRepository.findBy(dto.customer.name);
    if (!customer) {
      customer = await this.customerRepository.create(
        new Customer(
          crypto.randomUUID(),
          dto.customer.name,
          new Date(),
          new Date(),
        ),
      );
    }

    // Crear transaccion en estado PENDING
    const transaction = await this.transactionRepository.create(
      new Transaction(
        crypto.randomUUID(),
        TransactionStatus.PENDING,
        dto.amount,
        null, // paymentId no existe aun
        customer.id,
        dto.productId,
        new Date(),
        new Date(),
      ),
    );

    return transaction;
  }
}
