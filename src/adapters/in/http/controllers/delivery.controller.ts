import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { Delivery } from 'src/domain/models/delivery.entity';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  @Get('transaction/:transactionId')
  @ApiOperation({ summary: 'Get delivery by transaction ID' })
  @ApiParam({
    name: 'transactionId',
    type: String,
    description: 'Transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery found',
    type: Delivery,
  })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async getByTransactionId(
    @Param('transactionId') transactionId: string,
  ): Promise<Delivery> {
    const delivery =
      await this.deliveryRepository.findByTransactionId(transactionId);
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }
    return delivery;
  }
}
