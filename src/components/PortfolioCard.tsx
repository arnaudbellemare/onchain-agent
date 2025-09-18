interface PortfolioCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changePercent?: string;
  isPositive?: boolean;
}

export default function PortfolioCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  changePercent, 
  isPositive 
}: PortfolioCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      {change && changePercent && (
        <div className="mt-2">
          <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </p>
          <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {changePercent}
          </p>
        </div>
      )}
    </div>
  );
}
