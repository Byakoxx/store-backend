import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WompiPaymentProvider {
  constructor(private readonly httpService: HttpService) {}

  async getAcceptanceToken(apiUrl: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${apiUrl}/merchants/${process.env.WOMPI_PUBLIC_KEY}`,
        ),
      );
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch {
      throw new HttpException(
        'Error getting acceptance token from Wompi',
        HttpStatus.BAD_GATEWAY,
      );
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
      const response = await firstValueFrom(
        this.httpService.post(
          `${apiUrl}/payment_sources`,
          {
            customer_email: customerEmail,
            type: 'CARD',
            token,
            acceptance_token: acceptanceToken,
          },
          {
            headers: {
              Authorization: `Bearer ${privateKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating payment source in Wompi:',
        error?.response?.data || error,
      );
      throw new HttpException(
        'Error creating payment source in Wompi',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async createTransaction(payload: any, privateKey: string, apiUrl: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}/transactions`, payload, {
          headers: {
            Authorization: `Bearer ${privateKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        console.log('error creating transaction in Wompi', error.response.data);
        console.log(
          'error creating transaction in Wompi',
          error.response.status,
        );
        if (
          error.response.data.error.messages &&
          error.response.data.error.messages.signature &&
          error.response.data.error.messages.signature[0]
        ) {
          console.log(
            'error creating transaction in Wompi',
            error.response.data.error.messages.signature[0],
          );
        } else {
          console.log(
            'error creating transaction in Wompi',
            error.response.data.error.messages,
          );
        }
      } else {
        console.log('error creating transaction in Wompi', error);
      }
      throw new HttpException(
        'Error creating transaction in Wompi',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getTransactionStatus(transactionId: string, apiUrl: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/transactions/${transactionId}`),
      );
      return response.data;
    } catch {
      throw new HttpException(
        'Error getting transaction status from Wompi',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
