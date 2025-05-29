import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'prod-1', description: 'ID único del producto' })
  id: string;

  @ApiProperty({
    example: 'T-shirt',
    description: 'Product Name',
  })
  name: string;

  @ApiProperty({
    example: 'T-shirt',
    description: 'Product Description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 19.99, description: 'Product Price' })
  price: number;

  @ApiProperty({ example: 50, description: 'Product Stock' })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/product.jpg',
    description: 'Product Image',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    example: '2024-05-28T20:00:00.000Z',
    description: 'Product Created At',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-05-28T20:00:00.000Z',
    description: 'Product Updated At',
  })
  updatedAt: Date;
}
