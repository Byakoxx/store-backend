export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public price: number,
    public stock: number,
    public image: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
