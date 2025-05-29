import { Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/domain/models/customer.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { Transaction } from 'src/domain/models/transaction.entity';
import { CustomerRepository } from 'src/domain/ports-out/customer.repository';
import { PaymentProviderPort } from 'src/domain/ports-out/payment-provider.port';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { CreateTransactionDto } from 'src/shared/dto/create-transaction.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('PaymentProviderPort')
    private readonly paymentProvider: PaymentProviderPort,
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

    // 1. Crear la transacción en la base de datos con estado CREATED
    const transactionId = crypto.randomUUID();
    const transaction = await this.transactionRepository.create(
      new Transaction(
        transactionId,
        TransactionStatus.CREATED,
        dto.amount,
        null, // paymentId aún no existe
        customer.id,
        dto.productId,
        new Date(),
        new Date(),
      ),
    );

    if (!transaction) {
      throw new Error('Error al crear la transacción en la base de datos');
    }

    // 2. Llamar a Wompi para crear la transacción
    const apiUrl = process.env.WOMPI_API_URL!;
    const privateKey = process.env.WOMPI_PRIVATE_KEY!;
    const payload = {};
    const wompiResponse = await this.paymentProvider.createTransaction(
      payload,
      privateKey,
      apiUrl,
    );
    const wompiTransactionId = wompiResponse.data.id;
    const wompiStatus = wompiResponse.data.status as TransactionStatus;

    // 3. Actualizar la transacción en la base de datos con el wompiTransactionId y el estado
    const updatedTransaction = await this.transactionRepository.updateStatus(
      transactionId,
      wompiStatus,
      wompiTransactionId,
    );

    if (!updatedTransaction) {
      throw new Error('Error al actualizar la transacción en la base de datos');
    }

    return updatedTransaction;
  }
}
