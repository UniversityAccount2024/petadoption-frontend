import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig, RainbowKitProvider, } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http, } from 'wagmi';
import { mainnet, sepolia, } from 'wagmi/chains';
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query';

const queryClient = new QueryClient();
const config = getDefaultConfig({
  appName: 'PetAd Pet Lovers',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [sepolia.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);