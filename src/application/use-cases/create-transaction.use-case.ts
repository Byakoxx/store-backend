import { Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/domain/models/customer.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { Transaction } from 'src/domain/models/transaction.entity';
import { Delivery } from 'src/domain/models/delivery.entity';
import { DeliveryStatus } from 'src/domain/models/delivery-status.enum';
import { CustomerRepository } from 'src/domain/ports-out/customer.repository';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { PaymentProviderPort } from 'src/domain/ports-out/payment-provider.port';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
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
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
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
        dto.items,
      ),
    );

    if (!transaction) {
      throw new Error('Error al crear la transacción en la base de datos');
    }

    // 2. Llamar a Wompi para crear la transacción
    const apiUrl = process.env.WOMPI_API_URL!;
    const privateKey = process.env.WOMPI_PRIVATE_KEY!;
    const integritySecret = process.env.WOMPI_INTEGRITY_SIGNATURE!;

    // 2.1 Obtener acceptance token
    const acceptanceToken =
      await this.paymentProvider.getAcceptanceToken(apiUrl);

    // 2.2 Crear payment source
    const paymentSource = await this.paymentProvider.createPaymentSource(
      dto.customer.email,
      dto.paymentToken,
      acceptanceToken,
      apiUrl,
      privateKey,
    );

    const paymentSourceId = paymentSource.data.id;

    // 2.3 Generar referencia y firma
    const paymentReference =
      dto.reference || generatePaymentReference(dto.customer.email, Date.now());
    const signature = generateIntegritySignature(
      paymentReference,
      dto.amount,
      dto.currency,
      integritySecret,
    );

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

    console.log('wompiStatus en create transaction', wompiStatus);

    // 4. Si la transacción de Wompi fue creada y está pendiente, crear el delivery
    if (wompiStatus === TransactionStatus.PENDING) {
      // Crear delivery en estado CREATED
      await this.deliveryRepository.create(
        new Delivery(
          crypto.randomUUID(),
          DeliveryStatus.CREATED,
          dto.delivery.country,
          dto.delivery.city,
          dto.delivery.address,
          dto.delivery.zipCode,
          null, // trackingCode se genera después
          updatedTransaction.id,
          new Date(),
          new Date(),
          customer.id,
        ),
      );
    }

    return updatedTransaction;
  }
}
