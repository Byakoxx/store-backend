import { Product } from 'src/domain/models/product.entity';
import { ProductResponseDto } from './product-response.dto';

export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: product.image,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
