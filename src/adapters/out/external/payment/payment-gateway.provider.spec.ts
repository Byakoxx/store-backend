/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PaymentGatewayProvider } from './payment-gateway.provider';
import { of, throwError } from 'rxjs';
import { HttpException, BadRequestException } from '@nestjs/common';

describe('PaymentGatewayProvider', () => {
  let provider: PaymentGatewayProvider;
  let mockHttpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentGatewayProvider,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<PaymentGatewayProvider>(PaymentGatewayProvider);
    mockHttpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'test_token_123',
            },
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      process.env.PAYMENT_PUBLIC_KEY = 'pub_test_123';
      const result = await provider.getAcceptanceToken(
        'https://api.payment.co/v1',
      );

      expect(result).toBe('test_token_123');
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.payment.co/v1/merchants/pub_test_123',
      );
    });

    it('should throw HttpException when request fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        provider.getAcceptanceToken('https://api.payment.co/v1'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('createPaymentSource', () => {
    it('should create payment source successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'payment_source_123',
            type: 'CARD',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse as any));

      const result = await provider.createPaymentSource(
        'test@example.com',
        'token_123',
        'acceptance_token',
        'https://api.payment.co/v1',
        'prv_test_123',
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.payment.co/v1/payment_sources',
        {
          customer_email: 'test@example.com',
          type: 'CARD',
          token: 'token_123',
          acceptance_token: 'acceptance_token',
        },
        {
          headers: {
            Authorization: 'Bearer prv_test_123',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should throw HttpException when request fails', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        provider.createPaymentSource(
          'test@example.com',
          'token_123',
          'acceptance_token',
          'https://api.payment.co/v1',
          'prv_test_123',
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transaction_123',
            status: 'PENDING',
          },
        },
      };

      const payload = {
        amount_in_cents: 300000,
        currency: 'COP',
        reference: 'ref_123',
      };

      mockHttpService.post.mockReturnValue(of(mockResponse as any));

      const result = await provider.createTransaction(
        payload,
        'prv_test_123',
        'https://api.payment.co/v1',
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.payment.co/v1/transactions',
        payload,
        {
          headers: {
            Authorization: 'Bearer prv_test_123',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should throw BadRequestException for validation errors', async () => {
      const errorResponse = {
        response: {
          status: 422,
          data: {
            error: {
              type: 'INPUT_VALIDATION_ERROR',
              messages: ['Invalid amount'],
            },
          },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => errorResponse));

      await expect(
        provider.createTransaction(
          {},
          'prv_test_123',
          'https://api.payment.co/v1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw HttpException for other errors', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        provider.createTransaction(
          {},
          'prv_test_123',
          'https://api.payment.co/v1',
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getTransactionGatewayStatus', () => {
    it('should get transaction status successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transaction_123',
            status: 'APPROVED',
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await provider.getTransactionGatewayStatus(
        'transaction_123',
        'https://api.payment.co/v1',
        'prv_test_123',
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.payment.co/v1/transactions/transaction_123',
        {
          headers: {
            Authorization: 'Bearer prv_test_123',
          },
        },
      );
    });

    it('should throw HttpException when request fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        provider.getTransactionGatewayStatus(
          'transaction_123',
          'https://api.payment.co/v1',
          'prv_test_123',
        ),
      ).rejects.toThrow(HttpException);
    });
  });
});
