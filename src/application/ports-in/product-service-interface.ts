import { Product } from 'src/domain/models/product.entity';

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product>;
}
