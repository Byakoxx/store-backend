import * as crypto from 'crypto';

const WOMPI_INTEGRITY_SIGNATURE =
  process.env.WOMPI_INTEGRITY_SIGNATURE ||
  'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';

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

export function generateWompiSignature(
  reference: string,
  amountInCents: number,
  randomTimeOfDay: string,
  integritySignature: string = WOMPI_INTEGRITY_SIGNATURE,
): string {
  const data = `${reference}${randomTimeOfDay}${amountInCents}COP${integritySignature}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}
