import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentTransactionStatusDto } from 'src/shared/dto/payment-transaction-status.dto';

@Injectable()
export class PaymentGatewayProvider {
  constructor(private readonly httpService: HttpService) {}

  async getAcceptanceToken(apiUrl: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${apiUrl}/merchants/${process.env.PAYMENT_PUBLIC_KEY}`,
        ),
      );
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch {
      throw new HttpException(
        'Error getting acceptance token from Payment Gateway',
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
        'Error creating payment source in Payment Gateway:',
        error?.response?.data || error,
      );
      throw new HttpException(
        'Error creating payment source in Payment Gateway',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async createTransaction(
    payload: any,
    privateKey: string,
    apiUrl: string,
  ): Promise<any> {
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
      if (error?.response?.status === 422) {
        throw new BadRequestException(
          error?.response?.data?.error?.messages || 'Validation error',
        );
      }
      throw new HttpException(
        'Error creating transaction in Payment Gateway',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getTransactionGatewayStatus(
    transactionId: string,
    apiUrl: string,
    privateKey: string,
  ): Promise<PaymentTransactionStatusDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaymentTransactionStatusDto>(
          `${apiUrl}/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${privateKey}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error getting transaction status from Payment Gateway:',
        error,
      );
      throw new HttpException(
        'Error getting transaction status from Payment Gateway',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getEvents(apiUrl: string, privateKey: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/events`, {
          headers: {
            Authorization: `Bearer ${privateKey}`,
          },
        }),
      );
      return response.data;
    } catch {
      throw new HttpException(
        'Error getting transaction status from Payment Gateway',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
