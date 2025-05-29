import { Product } from '../models/product.entity';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decreaseStock(productId: string, quantity: number): Promise<void>;
}
