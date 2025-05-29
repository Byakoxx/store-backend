import { generatePaymentReference } from './payment-reference.util';
import * as crypto from 'crypto';

describe('PaymentReferenceUtil', () => {
  describe('generatePaymentReference', () => {
    it('should generate a consistent hash for same inputs', () => {
      const email = 'test@example.com';
      const date = 1640995200000; // Fixed timestamp

      const reference1 = generatePaymentReference(email, date);
      const reference2 = generatePaymentReference(email, date);

      expect(reference1).toBe(reference2);
      expect(reference1).toHaveLength(64); // SHA256 hash length
      expect(typeof reference1).toBe('string');
    });

    it('should generate different hashes for different inputs', () => {
      const email1 = 'test1@example.com';
      const email2 = 'test2@example.com';
      const date = 1640995200000;

      const reference1 = generatePaymentReference(email1, date);
      const reference2 = generatePaymentReference(email2, date);

      expect(reference1).not.toBe(reference2);
    });

    it('should generate different hashes for different dates', () => {
      const email = 'test@example.com';
      const date1 = 1640995200000;
      const date2 = 1641081600000;

      const reference1 = generatePaymentReference(email, date1);
      const reference2 = generatePaymentReference(email, date2);

      expect(reference1).not.toBe(reference2);
    });

    it('should use SHA256 algorithm', () => {
      const email = 'test@example.com';
      const date = 1640995200000;
      const expectedHash = crypto
        .createHash('sha256')
        .update(`${email}${date}`)
        .digest('hex');

      const reference = generatePaymentReference(email, date);

      expect(reference).toBe(expectedHash);
    });
  });
});
