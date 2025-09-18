"use client";

interface WalletProviderProps {
  children: React.ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  // For now, just return children without Privy integration
  // This will be updated when Privy is properly configured
  return <>{children}</>;
}
