import * as crypto from 'crypto';

/**
 * Genera la firma de integridad requerida por el gateway de pagos
 * @param reference Referencia única de la transacción
 * @param amount Monto en centavos
 * @param currency Moneda (COP, USD, etc.)
 * @param integrityKey Clave de integridad del gateway
 * @returns Hash SHA256 de integridad
 */
export function generateIntegritySignature(
  reference: string,
  amount: number,
  currency: string,
  integrityKey: string,
): string {
  const concatenatedString = `${reference}${amount}${currency}${integrityKey}`;
  return crypto.createHash('sha256').update(concatenatedString).digest('hex');
}
