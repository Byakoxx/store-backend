import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: '1', description: 'Customer ID' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer Name' })
  name: string;

  @ApiProperty({ example: '2021-01-01', description: 'Customer Created At' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-05-28T20:00:00.000Z',
    description: 'Customer Updated At',
  })
  updatedAt: Date;
}
