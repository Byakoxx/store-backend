import { DeliveryStatus } from './delivery-status.enum';

export class Delivery {
  constructor(
    public readonly id: string,
    public status: DeliveryStatus,
    public country: string,
    public city: string,
    public address: string,
    public zipCode: string,
    public trackingCode: string | null,
    public transactionId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public customerId: string,
  ) {}
}
