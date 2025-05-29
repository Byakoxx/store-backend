/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PaymentGatewayProvider } from './payment-gateway.provider';
import { of, throwError } from 'rxjs';

describe('PaymentGatewayProvider', () => {
  let provider: PaymentGatewayProvider;
  let httpService: HttpService;

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
    httpService = module.get<HttpService>(HttpService);
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

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

      const result = await provider.getAcceptanceToken('https://api.test.com');

      expect(result).toBe('test_token_123');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.test.com/merchants/{pub_key}',
      );
    });

    it('should handle errors when getting acceptance token', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Network error')));

      await expect(
        provider.getAcceptanceToken('https://api.test.com'),
      ).rejects.toThrow('Network error');
    });
  });

  describe('createPaymentSource', () => {
    it('should create payment source successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'payment_source_123',
          },
        },
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as any));

      const result = await provider.createPaymentSource(
        'test@example.com',
        'card_token_123',
        'acceptance_token_123',
        'https://api.test.com',
        'private_key_123',
      );

      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.test.com/payment_sources',
        {
          type: 'CARD',
          token: 'card_token_123',
          customer_email: 'test@example.com',
          acceptance_token: 'acceptance_token_123',
        },
        {
          headers: {
            Authorization: 'Bearer private_key_123',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle errors when creating payment source', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error('Network error')));

      await expect(
        provider.createPaymentSource(
          'test@example.com',
          'card_token_123',
          'acceptance_token_123',
          'https://api.test.com',
          'private_key_123',
        ),
      ).rejects.toThrow('Network error');
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockPayload = {
        amount_in_cents: 300000,
        currency: 'COP',
        customer_email: 'test@example.com',
      };

      const mockResponse = {
        data: {
          data: {
            id: 'transaction_123',
            status: 'PENDING',
          },
        },
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as any));

      const result = await provider.createTransaction(
        mockPayload,
        'private_key_123',
        'https://api.test.com',
      );

      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.test.com/transactions',
        mockPayload,
        {
          headers: {
            Authorization: 'Bearer private_key_123',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle errors when creating transaction', async () => {
      const mockPayload = {
        amount_in_cents: 300000,
        currency: 'COP',
        customer_email: 'test@example.com',
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error('Network error')));

      await expect(
        provider.createTransaction(
          mockPayload,
          'private_key_123',
          'https://api.test.com',
        ),
      ).rejects.toThrow('Network error');
    });
  });

  describe('getTransactionStatus', () => {
    beforeEach(() => {
      process.env.PAYMENT_PRIVATE_KEY = 'test_private_key';
    });

    it('should get transaction status successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transaction_123',
            status: 'APPROVED',
          },
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

      const result = await provider.getTransactionStatus(
        'transaction_123',
        'https://api.test.com',
      );

      expect(result).toEqual(mockResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.test.com/transactions/transaction_123',
        {
          headers: {
            Authorization: 'Bearer test_private_key',
          },
        },
      );
    });

    it('should handle errors when getting transaction status', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Network error')));

      await expect(
        provider.getTransactionStatus(
          'transaction_123',
          'https://api.test.com',
        ),
      ).rejects.toThrow('Network error');
    });
  });

  describe('getTransactionGatewayStatus', () => {
    it('should get transaction gateway status successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transaction_123',
            status: 'APPROVED',
          },
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

      const result = await provider.getTransactionGatewayStatus(
        'transaction_123',
        'https://api.test.com',
        'private_key_123',
      );

      expect(result).toEqual(mockResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.test.com/transactions/transaction_123',
        {
          headers: {
            Authorization: 'Bearer private_key_123',
          },
        },
      );
    });

    it('should handle errors when getting transaction gateway status', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Network error')));

      await expect(
        provider.getTransactionGatewayStatus(
          'transaction_123',
          'https://api.test.com',
          'private_key_123',
        ),
      ).rejects.toThrow('Network error');
    });
  });
});
