import React, { useState } from 'react';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';

const WalletManager = () => {
  const { wallet, isAuthenticated, connect, disconnect, primaryWallet, setNetwork, network } = useDynamicContext();
  const [isWalletListVisible, setIsWalletListVisible] = useState(false);

  const requiredNetwork = {
    chainId: '0x66eed', // Arbitrum Sepolia Testnet
    chainName: 'Arbitrum Sepolia',
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia-explorer.arbitrum.io'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  };

  const toggleWalletList = () => {
    setIsWalletListVisible(!isWalletListVisible);
  };

  const handleNetworkSwitch = async () => {
    if (network?.chainId !== requiredNetwork.chainId) {
      try {
        await setNetwork(requiredNetwork.chainId);
        console.log('Switched to Arbitrum Sepolia.');
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    } else {
      console.log('Already on Arbitrum Sepolia.');
    }
  };

  return (
    <div className="wallet-manager">
      {!isAuthenticated ? (
        <>
          <h1>Connect Your Wallet</h1>
          <DynamicWidget />
        </>
      ) : (
        <>
          <h1>Connected Wallet</h1>
          <p>Address: {wallet?.address || primaryWallet?.address}</p>
          <p>Network: {network?.chainName}</p>
          <button onClick={handleNetworkSwitch}>Switch to Arbitrum Sepolia</button>
          <button onClick={disconnect}>Disconnect Wallet</button>
        </>
      )}
    </div>
  );
};

export default WalletManager;
