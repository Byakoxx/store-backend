import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'prod-1', description: 'ID único del producto' })
  id: string;

  @ApiProperty({
    example: 'Camiseta básica',
    description: 'Nombre del producto',
  })
  name: string;

  @ApiProperty({
    example: 'Camiseta de algodón 100% orgánico',
    description: 'Descripción del producto',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 19.99, description: 'Precio del producto' })
  price: number;

  @ApiProperty({ example: 50, description: 'Unidades disponibles en stock' })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/camiseta.jpg',
    description: 'URL de la imagen del producto',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    example: '2024-05-28T20:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-05-28T20:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}
