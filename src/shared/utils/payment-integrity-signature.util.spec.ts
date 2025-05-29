import { generateIntegritySignature } from './payment-integrity-signature.util';

describe('PaymentIntegritySignatureUtil', () => {
  describe('generateIntegritySignature', () => {
    it('should generate correct integrity signature', () => {
      const reference = 'test_ref_123';
      const amount = 300000;
      const currency = 'COP';
      const integrityKey = 'test_integrity_key';

      const signature = generateIntegritySignature(
        reference,
        amount,
        currency,
        integrityKey,
      );

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex string length
    });

    it('should generate the same signature for identical inputs', () => {
      const reference = 'ref_456';
      const amount = 150000;
      const currency = 'USD';
      const integrityKey = 'consistency_key';

      const signature1 = generateIntegritySignature(
        reference,
        amount,
        currency,
        integrityKey,
      );
      const signature2 = generateIntegritySignature(
        reference,
        amount,
        currency,
        integrityKey,
      );

      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different references', () => {
      const amount = 200000;
      const currency = 'COP';
      const integrityKey = 'same_key';

      const signature1 = generateIntegritySignature(
        'ref_1',
        amount,
        currency,
        integrityKey,
      );
      const signature2 = generateIntegritySignature(
        'ref_2',
        amount,
        currency,
        integrityKey,
      );

      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different amounts', () => {
      const reference = 'same_ref';
      const currency = 'COP';
      const integrityKey = 'same_key';

      const signature1 = generateIntegritySignature(
        reference,
        100000,
        currency,
        integrityKey,
      );
      const signature2 = generateIntegritySignature(
        reference,
        200000,
        currency,
        integrityKey,
      );

      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different currencies', () => {
      const reference = 'same_ref';
      const amount = 300000;
      const integrityKey = 'same_key';

      const signature1 = generateIntegritySignature(
        reference,
        amount,
        'COP',
        integrityKey,
      );
      const signature2 = generateIntegritySignature(
        reference,
        amount,
        'USD',
        integrityKey,
      );

      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different integrity keys', () => {
      const reference = 'same_ref';
      const amount = 300000;
      const currency = 'COP';

      const signature1 = generateIntegritySignature(
        reference,
        amount,
        currency,
        'key_1',
      );
      const signature2 = generateIntegritySignature(
        reference,
        amount,
        currency,
        'key_2',
      );

      expect(signature1).not.toBe(signature2);
    });
  });
}); 