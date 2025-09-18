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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium opacity-50">
        Loading...
      </div>
    );
  }

  // Show connect button if not authenticated
  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
      >
        Connect Wallet
      </button>
    );
  }

  // Get the primary wallet
  const primaryWallet = wallets[0];
  const walletAddress = address || primaryWallet?.address;

  return (
    <div className="flex items-center space-x-4">
      {/* Wallet Info */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No wallet connected'}
          </div>
          <div className="text-xs text-gray-400">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
          </div>
        </div>
        
        {/* Wallet Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Connected</span>
        </div>
      </div>

      {/* Wallet Type */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/10">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <span className="text-xs text-white">
            {primaryWallet?.walletClientType === 'privy' ? 'Privy Wallet' : primaryWallet?.walletClientType || 'Wallet'}
          </span>
        </div>
      </div>

      {/* User Info */}
      {user?.email && (
        <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/10">
          <span className="text-xs text-gray-300">
            {user.email.address}
          </span>
        </div>
      )}

      {/* Disconnect Button */}
      <button
        onClick={logout}
        className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-3 py-1 rounded-lg text-sm transition-all duration-200 border border-white/10"
      >
        Disconnect
      </button>
    </div>
  );
}
