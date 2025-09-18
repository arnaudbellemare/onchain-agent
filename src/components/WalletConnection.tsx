"use client";

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';

export default function WalletConnection() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium">
        Loading...
      </div>
    );
  }

  // Show connect button if not authenticated
  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
      >
        Connect Wallet
      </button>
    );
  }

  // Get the primary wallet
  const primaryWallet = wallets[0];
  const walletAddress = address || primaryWallet?.address;

  return (
    <div className="flex items-center space-x-3">
      {/* Wallet Info */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No wallet connected'}
          </div>
          <div className="text-xs text-gray-500">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
          </div>
        </div>
        
        {/* Wallet Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600">Connected</span>
        </div>
      </div>

      {/* Wallet Type */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-xs text-gray-700">
            {primaryWallet?.walletClientType === 'privy' ? 'Privy Wallet' : primaryWallet?.walletClientType || 'Wallet'}
          </span>
        </div>
      </div>

      {/* User Info */}
      {user?.email && (
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-600">
            {user.email.address}
          </span>
        </div>
      )}

      {/* Disconnect Button */}
      <button
        onClick={logout}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition-all duration-200 border border-gray-200"
      >
        Disconnect
      </button>
    </div>
  );
}
