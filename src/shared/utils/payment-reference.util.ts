import * as crypto from 'crypto';

export function generatePaymentReference(email: string, date: number): string {
  const stringHash = `${email}${date}`;
  return crypto.createHash('sha256').update(stringHash).digest('hex');
}
