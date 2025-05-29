export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
