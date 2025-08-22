import * as UpstoxSDK from 'upstox-js-sdk';

export class UpstoxClient {
  private apiClient: any;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.apiClient = UpstoxSDK.ApiClient.instance;
    this.apiClient.authentications['OAUTH2'].accessToken = accessToken;
  }

  async getProfile() {
    return new Promise((resolve, reject) => {
      const userApi = new UpstoxSDK.UserApi();
      userApi.getProfile('2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data);
        }
      });
    });
  }

  async getPositions() {
    return new Promise((resolve, reject) => {
      const portfolioApi = new UpstoxSDK.PortfolioApi();
      portfolioApi.getPositions('2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data || []);
        }
      });
    });
  }

  async getHoldings() {
    return new Promise((resolve, reject) => {
      const portfolioApi = new UpstoxSDK.PortfolioApi();
      portfolioApi.getHoldings('2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data || []);
        }
      });
    });
  }

  async getOrderBook() {
    return new Promise((resolve, reject) => {
      const orderApi = new UpstoxSDK.OrderApi();
      orderApi.getOrderBook('2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data || []);
        }
      });
    });
  }

  async placeOrder(orderData: {
    instrumentToken: string;
    quantity: number;
    price: number;
    product: string;
    validity: string;
    orderType: string;
    transactionType: string;
    disclosedQuantity: number;
    triggerPrice: number;
    isAmo: boolean;
  }) {
    return new Promise((resolve, reject) => {
      const orderApi = new UpstoxSDK.OrderApi();
      const placeOrderRequest = new UpstoxSDK.PlaceOrderRequest(
        orderData.quantity,
        orderData.product,
        orderData.validity,
        orderData.price,
        orderData.instrumentToken,
        orderData.orderType,
        orderData.transactionType,
        orderData.disclosedQuantity,
        orderData.triggerPrice,
        orderData.isAmo
      );

      orderApi.placeOrder(placeOrderRequest, '2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data);
        }
      });
    });
  }

  async getLTP(instrumentKeys: string[]) {
    return new Promise((resolve, reject) => {
      const marketQuoteApi = new UpstoxSDK.MarketQuoteApi();
      const symbol = instrumentKeys.join(',');
      
      marketQuoteApi.ltp(symbol, '2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data);
        }
      });
    });
  }

  async getMarketQuote(instrumentKeys: string[]) {
    return new Promise((resolve, reject) => {
      const marketQuoteApi = new UpstoxSDK.MarketQuoteApi();
      const symbol = instrumentKeys.join(',');
      
      marketQuoteApi.getFullMarketQuote(symbol, '2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data);
        }
      });
    });
  }

  async getUserFunds() {
    return new Promise((resolve, reject) => {
      const userApi = new UpstoxSDK.UserApi();
      userApi.getUserFundMargin('2.0', {}, (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data);
        }
      });
    });
  }

  async cancelOrder(orderId: string) {
    return new Promise((resolve, reject) => {
      const orderApi = new UpstoxSDK.OrderApi();
      orderApi.cancelOrder(orderId, '2.0', (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.data);
        }
      });
    });
  }
}