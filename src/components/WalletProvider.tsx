"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

interface WalletProviderProps {
  children: React.ReactNode;
}

// Create wagmi config
const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Create query client
const queryClient = new QueryClient();

export default function WalletProvider({ children }: WalletProviderProps) {
  // Use the provided Privy app ID
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmfow1b160026l60btyr8fjp5';

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Customize the appearance of the login modal
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png',
        },
        // Configure login methods
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'],
        // Configure embedded wallets
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        // Configure supported chains
        defaultChain: baseSepolia,
        supportedChains: [base, baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
