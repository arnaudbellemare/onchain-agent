"use client";

import { useState } from 'react';

export default function WalletConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
      setIsLoading(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Wallet Info */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No wallet connected'}
          </div>
          <div className="text-xs text-gray-400">
            2.8473 ETH
          </div>
        </div>
        
        {/* Wallet Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-400">Connected</span>
        </div>
      </div>

      {/* Wallet Type */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-lg">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-white">
            CDP Wallet
          </span>
        </div>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
