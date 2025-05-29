import { generatePaymentSignature, getRandomTimeOfDay } from './payment-signature.util';

describe('PaymentSignatureUtil', () => {
  describe('generatePaymentSignature', () => {
    it('should generate correct signature with provided parameters', () => {
      const reference = 'ref_123';
      const amount = 300000;
      const currency = 'COP';
      const integritySignature = 'test_signature';

      const signature = generatePaymentSignature(
        reference,
        amount,
        currency,
        integritySignature,
      );

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex string length
    });

    it('should generate the same signature for the same input', () => {
      const reference = 'ref_456';
      const amount = 150000;
      const currency = 'USD';
      const integritySignature = 'consistent_signature';

      const signature1 = generatePaymentSignature(
        reference,
        amount,
        currency,
        integritySignature,
      );
      const signature2 = generatePaymentSignature(
        reference,
        amount,
        currency,
        integritySignature,
      );

      expect(signature1).toBe(signature2);
    });

    it('should use default integrity signature when not provided', () => {
      const reference = 'ref_789';
      const amount = 250000;
      const currency = 'COP';

      const signature = generatePaymentSignature(reference, amount, currency);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64);
    });

    it('should generate different signatures for different inputs', () => {
      const signature1 = generatePaymentSignature('ref1', 100000, 'COP');
      const signature2 = generatePaymentSignature('ref2', 100000, 'COP');

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('getRandomTimeOfDay', () => {
    it('should return a string', () => {
      const result = getRandomTimeOfDay();
      expect(typeof result).toBe('string');
    });

    it('should return a hash (64 characters)', () => {
      const result = getRandomTimeOfDay();
      expect(result.length).toBe(64);
    });

    it('should return different values on multiple calls', () => {
      const result1 = getRandomTimeOfDay();
      const result2 = getRandomTimeOfDay();
      
      // While there's a tiny chance they could be the same, it's extremely unlikely
      expect(result1).not.toBe(result2);
    });
  });
}); 