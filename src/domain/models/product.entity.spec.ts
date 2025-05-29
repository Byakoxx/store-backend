import { Product } from './product.entity';

describe('Product Entity', () => {
  const mockDate = new Date('2024-01-01');

  it('should create a product instance', () => {
    const product = new Product(
      'prod-1',
      'Test Product',
      'Test Description',
      99.99,
      10,
      'https://example.com/image.jpg',
      mockDate,
      mockDate,
    );

    expect(product.id).toBe('prod-1');
    expect(product.name).toBe('Test Product');
    expect(product.description).toBe('Test Description');
    expect(product.price).toBe(99.99);
    expect(product.stock).toBe(10);
    expect(product.image).toBe('https://example.com/image.jpg');
    expect(product.createdAt).toBe(mockDate);
    expect(product.updatedAt).toBe(mockDate);
  });

  it('should create a product with null description and image', () => {
    const product = new Product(
      'prod-2',
      'Test Product 2',
      null,
      49.99,
      5,
      null,
      mockDate,
      mockDate,
    );

    expect(product.description).toBeNull();
    expect(product.image).toBeNull();
  });

  it('should allow modification of mutable properties', () => {
    const product = new Product(
      'prod-3',
      'Test Product 3',
      'Original Description',
      29.99,
      15,
      null,
      mockDate,
      mockDate,
    );

    product.name = 'Updated Name';
    product.description = 'Updated Description';
    product.price = 39.99;
    product.stock = 20;

    expect(product.name).toBe('Updated Name');
    expect(product.description).toBe('Updated Description');
    expect(product.price).toBe(39.99);
    expect(product.stock).toBe(20);
  });
});
