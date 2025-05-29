export class Delivery {
  constructor(
    public readonly id: string,
    public status: string,
    public address: string,
    public trackingCode: string | null,
    public transactionId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public customerId: string,
  ) {}
}
