import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentProviderPort } from 'src/domain/ports-out/payment-provider.port';

@Injectable()
export class PaymentGatewayProvider implements PaymentProviderPort {
  constructor(private readonly httpService: HttpService) {}

  async getAcceptanceToken(apiUrl: string): Promise<string> {
    try {
      const publicKey = process.env.PAYMENT_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('PAYMENT_PUBLIC_KEY environment variable is not set');
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/merchants/${publicKey}`),
      );
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error) {
      console.error(
        'Error getting acceptance token from Payment Gateway:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async createPaymentSource(
    customerEmail: string,
    token: string,
    acceptanceToken: string,
    apiUrl: string,
    privateKey: string,
  ): Promise<any> {
    try {
      // DEBUG: Log the privateKey to see what's wrong
      console.log('🔍 DEBUG privateKey length:', privateKey?.length);
      console.log(
        '🔍 DEBUG privateKey chars:',
        privateKey?.split('').slice(0, 10),
      );
      console.log(
        '🔍 DEBUG privateKey includes spaces:',
        privateKey?.includes(' '),
      );
      console.log(
        '🔍 DEBUG privateKey includes newlines:',
        privateKey?.includes('\n'),
      );

      // CLEAN the privateKey by removing newlines and spaces
      const cleanPrivateKey = privateKey?.replace(/[\n\r\s]/g, '');
      console.log('🧹 CLEANED privateKey length:', cleanPrivateKey?.length);

      const payload = {
        type: 'CARD',
        token: token,
        customer_email: customerEmail,
        acceptance_token: acceptanceToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}/payment_sources`, payload, {
          headers: {
            Authorization: `Bearer ${cleanPrivateKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error creating payment source in Payment Gateway:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async createTransaction(
    payload: any,
    privateKey: string,
    apiUrl: string,
  ): Promise<any> {
    try {
      // CLEAN the privateKey by removing newlines and spaces
      const cleanPrivateKey = privateKey?.replace(/[\n\r\s]/g, '');

      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}/transactions`, payload, {
          headers: {
            Authorization: `Bearer ${cleanPrivateKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error creating transaction in Payment Gateway:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async getTransactionStatus(
    transactionId: string,
    apiUrl: string,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${process.env.PAYMENT_PRIVATE_KEY}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error getting transaction status from Payment Gateway:',
        error,
      );
      throw error;
    }
  }

  async getTransactionGatewayStatus(
    transactionId: string,
    apiUrl: string,
    privateKey: string,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${privateKey}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error getting transaction status from Payment Gateway:',
        error,
      );
      throw error;
    }
  }
}
