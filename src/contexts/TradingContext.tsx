import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UpstoxClient } from '../services/upstoxClient';
import { useAuth } from './AuthContext';

interface Position {
  instrumentToken: string;
  tradingSymbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  product: string;
}

interface Holding {
  instrumentToken: string;
  tradingSymbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  dayChange: number;
  dayChangePercentage: number;
}

interface Order {
  orderId: string;
  instrumentToken: string;
  tradingSymbol: string;
  exchange: string;
  orderType: string;
  transactionType: string;
  quantity: number;
  price: number;
  status: string;
  orderTimestamp: string;
}

interface TradingContextType {
  positions: Position[];
  holdings: Holding[];
  orders: Order[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

interface TradingProviderProps {
  children: ReactNode;
}

export const TradingProvider: React.FC<TradingProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('upstox_access_token');
      if (!token) return;

      const upstoxClient = new UpstoxClient(token);

      // Fetch positions, holdings, and orders in parallel
      const [positionsData, holdingsData, ordersData] = await Promise.all([
        upstoxClient.getPositions().catch(() => []),
        upstoxClient.getHoldings().catch(() => []),
        upstoxClient.getOrderBook().catch(() => []),
      ]);

      setPositions(positionsData);
      setHoldings(holdingsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to refresh trading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const value = {
    positions,
    holdings,
    orders,
    refreshData,
    loading,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
};