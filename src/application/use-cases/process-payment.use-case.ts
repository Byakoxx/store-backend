import { Inject, Injectable } from '@nestjs/common';
import { PaymentProviderPort } from 'src/domain/ports-out/payment-provider.port';
import { PaymentRequestDto } from 'src/shared/dto/payment-request.dto';
import { PaymentResponseDto } from 'src/shared/dto/payment-response.dto';
import { generatePaymentReference } from 'src/shared/utils/payment-reference.util';
import { generateIntegritySignature } from 'src/shared/utils/wompi-integrity-signature.util';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('PaymentProviderPort')
    private readonly paymentProvider: PaymentProviderPort,
  ) {}

  async execute(dto: PaymentRequestDto): Promise<PaymentResponseDto> {
    const apiUrl = process.env.WOMPI_API_URL!;
    const privateKey = process.env.WOMPI_PRIVATE_KEY!;
    const integritySecret =
      process.env.WOMPI_INTEGRITY_SIGNATURE ||
      'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';

    // Usar email válido por defecto si no viene en el DTO
    const customerEmail =
      dto.customerEmail && dto.customerEmail.trim() !== ''
        ? dto.customerEmail.trim()
        : 'test123@example.com';

    // 1. Obtener acceptance token
    const acceptanceToken =
      await this.paymentProvider.getAcceptanceToken(apiUrl);

    // 2. Crear payment source
    const paymentSource = await this.paymentProvider.createPaymentSource(
      customerEmail,
      dto.token,
      acceptanceToken,
      apiUrl,
      privateKey,
    );
    const paymentSourceId = paymentSource.data.id;

    // 3. Generar referencia de pago única
    const paymentReference = generatePaymentReference(
      customerEmail,
      Date.now(),
    );

    // 4. Generar firma de integridad
    const signature = generateIntegritySignature(
      paymentReference,
      dto.amountInCents,
      dto.currency,
      integritySecret,
    );

    // 5. Construir el payload para la transacción
    const payload = {
      amount_in_cents: dto.amountInCents,
      currency: dto.currency,
      signature,
      customer_email: customerEmail,
      reference: paymentReference,
      payment_method: {
        installments: dto.installments,
      },
      payment_source_id: paymentSourceId,
      acceptance_token: acceptanceToken,
    };

    console.log('payload', payload);

    // 6. Crear la transacción
    const wompiResponse = await this.paymentProvider.createTransaction(
      payload,
      privateKey,
      apiUrl,
    );

    return {
      status: wompiResponse.data.status,
      wompiTransactionId: wompiResponse.data.id,
      statusMessage: wompiResponse.data.status_message,
      processorResponseCode:
        wompiResponse.data.payment_method?.extra?.processor_response_code,
    };
  }
}
