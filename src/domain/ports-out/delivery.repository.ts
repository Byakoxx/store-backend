import { Delivery } from '../models/delivery.entity';
import { DeliveryStatus } from '../models/delivery-status.enum';

export interface DeliveryRepository {
  create(delivery: Delivery): Promise<Delivery>;
  updateStatus(
    transactionId: string,
    status: DeliveryStatus,
  ): Promise<Delivery | null>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
}
