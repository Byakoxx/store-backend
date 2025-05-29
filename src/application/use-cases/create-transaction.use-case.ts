import { Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/domain/models/customer.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { Transaction } from 'src/domain/models/transaction.entity';
import { CustomerRepository } from 'src/domain/ports-out/customer.repository';
import { PaymentProviderPort } from 'src/domain/ports-out/payment-provider.port';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { CreateTransactionDto } from 'src/shared/dto/create-transaction.dto';
import { generatePaymentReference } from 'src/shared/utils/payment-reference.util';
import { generateIntegritySignature } from 'src/shared/utils/wompi-integrity-signature.util';

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

    console.log('transaction', transaction);
    console.log('dto', dto);

    if (!transaction) {
      throw new Error('Error al crear la transacción en la base de datos');
    }

    // 2. Llamar a Wompi para crear la transacción
    const apiUrl = process.env.WOMPI_API_URL!;
    const privateKey = process.env.WOMPI_PRIVATE_KEY!;
    const integritySecret = process.env.WOMPI_INTEGRITY_SIGNATURE!;

    console.log('apiUrl', apiUrl);
    console.log('privateKey', privateKey);
    console.log('integritySecret', integritySecret);

    // 2.1 Obtener acceptance token
    const acceptanceToken =
      await this.paymentProvider.getAcceptanceToken(apiUrl);

    console.log('acceptanceToken despues ✅', acceptanceToken);

    // 2.2 Crear payment source
    const paymentSource = await this.paymentProvider.createPaymentSource(
      dto.customer.email,
      dto.paymentToken,
      acceptanceToken,
      apiUrl,
      privateKey,
    );

    console.log('paymentSource despues ✅', paymentSource);

    const paymentSourceId = paymentSource.data.id;

    console.log('paymentSourceId despues ✅', paymentSourceId);

    // 2.3 Generar referencia y firma
    const paymentReference =
      dto.reference || generatePaymentReference(dto.customer.email, Date.now());
    const signature = generateIntegritySignature(
      paymentReference,
      dto.amount,
      dto.currency,
      integritySecret,
    );

    console.log('signature', signature);

    // 2.4 Construir el payload para Wompi
    const payload = {
      amount_in_cents: dto.amount,
      currency: dto.currency,
      signature,
      customer_email: dto.customer.email,
      reference: paymentReference,
      payment_method: {
        installments: 1,
      },
      payment_source_id: paymentSourceId,
      acceptance_token: acceptanceToken,
    };

    console.log('payload', payload);

    // 2.5 Crear la transacción en Wompi
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
