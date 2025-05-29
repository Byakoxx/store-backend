export interface PaymentProviderPort {
  [x: string]: any;
  getAcceptanceToken(apiUrl: string): Promise<string>;
  createTransaction(
    payload: any,
    privateKey: string,
    apiUrl: string,
  ): Promise<any>;
  getTransactionStatus(transactionId: string, apiUrl: string): Promise<any>;
}
