interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change24h: string;
  change24hPercent: string;
}

interface AssetRowProps {
  asset: Asset;
  onSend: (asset: Asset) => void;
  onSwap: (asset: Asset) => void;
}

export default function AssetRow({ asset, onSend, onSwap }: AssetRowProps) {
  const isPositive = asset.change24h.startsWith('+');
  const isNegative = asset.change24h.startsWith('-');
  
  return (
    <tr className="hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {asset.symbol.charAt(0)}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-white">{asset.symbol}</div>
            <div className="text-sm text-gray-400">{asset.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{asset.balance}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{asset.value}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${
          isPositive ? 'text-green-400' : 
          isNegative ? 'text-red-400' : 
          'text-gray-400'
        }`}>
          {asset.change24h} ({asset.change24hPercent})
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button 
          onClick={() => onSend(asset)}
          className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
        >
          Send
        </button>
        <button 
          onClick={() => onSwap(asset)}
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          Swap
        </button>
      </td>
    </tr>
  );
}
