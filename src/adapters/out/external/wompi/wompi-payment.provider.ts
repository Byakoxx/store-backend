import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WompiTransactionStatusDto } from 'src/adapters/wompi/dtos/wompi-transaction-status.dto';

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
      console.log('createPaymentSource');
      console.log({
        customerEmail,
        token,
        acceptanceToken,
        apiUrl,
        privateKey,
      });

      console.log('payload dentro de createPaymentSource', {
        customer_email: customerEmail,
        type: 'CARD',
        token,
        acceptance_token: acceptanceToken,
      });

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
      console.log('error en createPaymentSource', error.response.data);
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
      if (
        error.response &&
        error.response.status === 422 &&
        error.response.data?.error?.type === 'INPUT_VALIDATION_ERROR'
      ) {
        // Error de validación de datos de usuario
        throw new BadRequestException(error.response.data.error.messages);
      }
      // Otros errores (por ejemplo, problemas de red, gateway, etc.)
      throw new HttpException(
        'Error creating transaction in Wompi',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getTransactionWompiStatus(
    transactionId: string,
    apiUrl: string,
    privateKey: string,
  ): Promise<WompiTransactionStatusDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<WompiTransactionStatusDto>(
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
      console.error('Error getting transaction status from Wompi:', error);
      throw new HttpException(
        'Error getting transaction status from Wompi',
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
