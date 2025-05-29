import { Delivery } from '../models/delivery.entity';

export interface DeliveryRepository {
  create(delivery: Delivery): Promise<Delivery>;
}
