import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProcessPaymentUseCase } from 'src/application/use-cases/process-payment.use-case';
import { PaymentResponseDto } from 'src/shared/dto/payment-response.dto';
import { PaymentRequestDto } from 'src/shared/dto/payment-request.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async processPayment(
    @Body() dto: PaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    return this.processPaymentUseCase.execute(dto);
  }
}
