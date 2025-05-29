import { Delivery } from './delivery.entity';
import { DeliveryStatus } from './delivery-status.enum';

describe('Delivery Entity', () => {
  const mockDate = new Date('2024-01-01');

  it('should create a delivery instance', () => {
    const delivery = new Delivery(
      'delivery-1',
      DeliveryStatus.CREATED,
      'Colombia',
      'Bogotá',
      'Calle 123 #45-67',
      '110111',
      null,
      'transaction-1',
      mockDate,
      mockDate,
      'customer-1',
    );

    expect(delivery.id).toBe('delivery-1');
    expect(delivery.status).toBe(DeliveryStatus.CREATED);
    expect(delivery.country).toBe('Colombia');
    expect(delivery.city).toBe('Bogotá');
    expect(delivery.address).toBe('Calle 123 #45-67');
    expect(delivery.zipCode).toBe('110111');
    expect(delivery.trackingCode).toBeNull();
    expect(delivery.transactionId).toBe('transaction-1');
    expect(delivery.customerId).toBe('customer-1');
  });

  it('should create a delivery with tracking code', () => {
    const delivery = new Delivery(
      'delivery-2',
      DeliveryStatus.IN_TRANSIT,
      'Colombia',
      'Medellín',
      'Carrera 43A #1-50',
      '050001',
      'TRK123456789',
      'transaction-2',
      mockDate,
      mockDate,
      'customer-2',
    );

    expect(delivery.trackingCode).toBe('TRK123456789');
    expect(delivery.status).toBe(DeliveryStatus.IN_TRANSIT);
  });

  it('should allow modification of mutable properties', () => {
    const delivery = new Delivery(
      'delivery-3',
      DeliveryStatus.CREATED,
      'Colombia',
      'Cali',
      'Avenida 6 Norte #23-45',
      '760001',
      null,
      'transaction-3',
      mockDate,
      mockDate,
      'customer-3',
    );

    delivery.status = DeliveryStatus.PREPARING;
    delivery.trackingCode = 'TRK987654321';

    expect(delivery.status).toBe(DeliveryStatus.PREPARING);
    expect(delivery.trackingCode).toBe('TRK987654321');
  });
});
