import React, { useState, useEffect } from 'react';
import CoinList from './CoinList';
import NFTList from './NFTList';
import Web3 from 'web3';

const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;

const ALCHEMY_RPC_URLS = {
  ETH_MAINNET: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ETH_TESTNET: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ARBITRUM_MAINNET: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ARBITRUM_TESTNET: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
};

const Balances = ({ targetAddress, network, isSeller, onNFTSelect }) => {
  const [coins, setCoins] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetAddress && network) {
      fetchUserBalances(targetAddress);
    }
  }, [targetAddress, network]);

  const fetchUserBalances = async (address) => {
    setLoading(true);

    try {
      const rpcUrl = ALCHEMY_RPC_URLS[network];
      if (!rpcUrl) {
        throw new Error(`Unsupported network: ${network}`);
      }

      const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

      await fetchCoinsBalance(web3, address);
      await fetchNFTs(rpcUrl, address);
    } catch (error) {
      console.error('Error fetching user balances:', error);
    }

    setLoading(false);
  };

  const fetchCoinsBalance = async (web3, address) => {
    try {
      const balances = [];
      const ethBalance = await web3.eth.getBalance(address);
      balances.push({ symbol: 'ETH', balance: parseFloat(web3.utils.fromWei(ethBalance, 'ether')) });

      setCoins(balances);
    } catch (error) {
      console.error('Error fetching coin balances:', error);
    }
  };

  const fetchNFTs = async (rpcUrl, address) => {
    try {
      const response = await fetch(`${rpcUrl}/getNFTs?owner=${address}`);
      const data = await response.json();

      const userNFTs = data.ownedNfts.map((nft) => ({
        name: nft.title || 'Unnamed NFT',
        image: nft.media[0]?.gateway || '',
        tokenId: nft.id.tokenId,
        contractAddress: nft.contract.address,
      }));

      setNfts(userNFTs);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  return (
    <div className="balances">
      {loading ? <p>Loading balances...</p> : null}
      <CoinList coins={coins} />
      <NFTList nfts={nfts} isSeller={isSeller} onNFTSelect={onNFTSelect} />
    </div>
  );
};

export default Balances;
