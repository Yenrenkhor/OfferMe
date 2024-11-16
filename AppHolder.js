import React, { useState } from 'react';
import Web3 from 'web3';
import Balances from './components/Balance/Balance';
import OfferForm from './components/OfferForm/OfferForm';

function App() {
  const [buyerAddress, setBuyerAddress] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);

  const connectToMetaMask = async () => {
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setBuyerAddress(accounts[0]);
        console.log(`Connected to MetaMask with address: ${accounts[0]}`);
      } else {
        alert('MetaMask is not installed. Please install MetaMask and try again.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const handleNetworkChange = (e) => {
    setNetwork(e.target.value);
  };

  const handleSellerAddressSubmit = (e) => {
    e.preventDefault();
    if (!sellerAddress.trim()) {
      alert('Please enter a valid seller address.');
      return;
    }
    console.log(`Seller address submitted: ${sellerAddress}`);
  };

  const handleNFTSelect = (contractAddress, tokenId) => {
    console.log(`Selected NFT: ${contractAddress}, Token ID: ${tokenId}`);
    setSelectedNFT({ contractAddress, tokenId });
  };

  const logout = () => {
    setBuyerAddress('');
    setSellerAddress('');
    setNetwork('');
    console.log('Logged out');
  };

  return (
    <div className="app-container">
      {!buyerAddress ? (
        <button onClick={connectToMetaMask}>Connect to MetaMask</button>
      ) : (
        <>
          <h1>Welcome, {buyerAddress}</h1>
          <button onClick={logout} style={{ marginBottom: '20px' }}>
            Logout
          </button>

          <div className="network-selector">
            <label>Select Network:</label>
            <select value={network} onChange={handleNetworkChange}>
              <option value="">-- Select a Network --</option>
              <option value="ETH_MAINNET">ETH Mainnet</option>
              <option value="ETH_TESTNET">ETH Testnet</option>
              <option value="ARBITRUM_MAINNET">Arbitrum Mainnet</option>
              <option value="ARBITRUM_TESTNET">Arbitrum Testnet</option>
            </select>
          </div>

          {network && (
            <>
              <h3>Buyer Assets</h3>
              <Balances targetAddress={buyerAddress} network={network} isSeller={false} />

              <div className="seller-section">
                <h3>Enter Seller Address</h3>
                <form onSubmit={handleSellerAddressSubmit}>
                  <label>
                    Seller Address:
                    <input
                      type="text"
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      placeholder="Enter Seller's Address"
                      required
                    />
                  </label>
                </form>

                {sellerAddress && (
                  <>
                    <h3>Seller Assets</h3>
                    <Balances targetAddress={sellerAddress} 
                    network={network} 
                    isSeller={true}
                    onNFTSelect={handleNFTSelect}
                    />
                  </>
                )}

                {selectedNFT && (
                  <>
                    <h3>Create Offer for Selected NFT</h3>
                    <OfferForm nftDetails={selectedNFT} buyerAddress={buyerAddress} sellerAddress={sellerAddress} />
                  </>
                )}

                
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
