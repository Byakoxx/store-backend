import * as crypto from 'crypto';

const PAYMENT_INTEGRITY_SIGNATURE =
  process.env.PAYMENT_INTEGRITY_SIGNATURE ||
  'test_integrity_4ab53b2b2d5fa0a6b5cd5dee5da56cb5';

export function getRandomTimeOfDay(): string {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);
  return crypto
    .createHash('sha256')
    .update(
      `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}${String(seconds).padStart(2, '0')}`,
    )
    .digest('hex');
}

/**
 * Genera la firma de integridad para transacciones con el gateway de pagos
 * @param reference Referencia única de la transacción
 * @param amount Monto en centavos
 * @param currency Moneda (COP, USD, etc.)
 * @param integritySignature Clave de integridad
 * @returns Hash SHA256
 */
export function generatePaymentSignature(
  reference: string,
  amount: number,
  currency: string,
  integritySignature: string = PAYMENT_INTEGRITY_SIGNATURE,
): string {
  const concatenatedString = `${reference}${amount}${currency}${integritySignature}`;
  return crypto.createHash('sha256').update(concatenatedString).digest('hex');
}
