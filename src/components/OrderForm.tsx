import React, { useState } from 'react';
import { UpstoxClient } from '../services/upstoxClient';
import { useTrading } from '../contexts/TradingContext';
import LoadingSpinner from './LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface OrderFormProps {
  instrumentToken?: string;
  tradingSymbol?: string;
  currentPrice?: number;
  onClose?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  instrumentToken = '',
  tradingSymbol = '',
  currentPrice = 0,
  onClose
}) => {
  const { refreshData } = useTrading();
  const [formData, setFormData] = useState({
    instrumentToken,
    tradingSymbol,
    quantity: 1,
    price: currentPrice,
    orderType: 'LIMIT',
    transactionType: 'BUY',
    product: 'D',
    validity: 'DAY',
    disclosedQuantity: 0,
    triggerPrice: 0,
    isAmo: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instrumentToken || !formData.tradingSymbol) {
      setMessage({ type: 'error', text: 'Please select a stock first' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      const token = localStorage.getItem('upstox_access_token');
      if (!token) throw new Error('No access token found');
      
      const upstoxClient = new UpstoxClient(token);
      
      await upstoxClient.placeOrder(formData);
      
      setMessage({ 
        type: 'success', 
        text: `${formData.transactionType} order placed successfully!` 
      });
      
      // Refresh trading data
      await refreshData();
      
      // Close form after success
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (error: any) {
      console.error('Order placement failed:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to place order' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const totalValue = formData.quantity * formData.price;

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Place Order</h2>
      
      {message && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 ${
          message.type === 'success' 
            ? 'bg-success-50 text-success-700' 
            : 'bg-danger-50 text-danger-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Stock Symbol</label>
          <input
            type="text"
            name="tradingSymbol"
            value={formData.tradingSymbol}
            onChange={handleInputChange}
            className="input"
            placeholder="e.g., RELIANCE"
            required
          />
        </div>

        <div>
          <label className="label">Instrument Token</label>
          <input
            type="text"
            name="instrumentToken"
            value={formData.instrumentToken}
            onChange={handleInputChange}
            className="input"
            placeholder="e.g., NSE_EQ|INE002A01018"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Transaction Type</label>
            <select
              name="transactionType"
              value={formData.transactionType}
              onChange={handleInputChange}
              className="input"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          <div>
            <label className="label">Order Type</label>
            <select
              name="orderType"
              value={formData.orderType}
              onChange={handleInputChange}
              className="input"
            >
              <option value="LIMIT">Limit</option>
              <option value="MARKET">Market</option>
              <option value="SL">Stop Loss</option>
              <option value="SL-M">Stop Loss Market</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="input"
              min="1"
              required
            />
          </div>

          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="input"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Product</label>
            <select
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              className="input"
            >
              <option value="D">Delivery</option>
              <option value="I">Intraday</option>
              <option value="MTF">MTF</option>
            </select>
          </div>

          <div>
            <label className="label">Validity</label>
            <select
              name="validity"
              value={formData.validity}
              onChange={handleInputChange}
              className="input"
            >
              <option value="DAY">Day</option>
              <option value="IOC">IOC</option>
            </select>
          </div>
        </div>

        {formData.orderType === 'SL' && (
          <div>
            <label className="label">Trigger Price (₹)</label>
            <input
              type="number"
              name="triggerPrice"
              value={formData.triggerPrice}
              onChange={handleInputChange}
              className="input"
              step="0.01"
              min="0"
            />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-semibold">₹{totalValue.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 ${
              formData.transactionType === 'BUY' ? 'btn-success' : 'btn-danger'
            }`}
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              `${formData.transactionType === 'BUY' ? 'Buy' : 'Sell'} ${formData.tradingSymbol}`
            )}
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OrderForm;