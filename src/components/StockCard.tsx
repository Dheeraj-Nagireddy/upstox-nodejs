import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
  onClick
}) => {
  const isPositive = change >= 0;

  return (
    <div 
      className="card hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{symbol}</h3>
          <p className="text-sm text-gray-500 truncate">{name}</p>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            ₹{price.toFixed(2)}
          </p>
          <div className={`flex items-center space-x-1 ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      
      {volume && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Volume: {volume.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockCard;