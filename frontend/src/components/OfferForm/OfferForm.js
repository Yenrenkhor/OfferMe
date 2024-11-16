import React, { useState } from 'react';
import ContractWrapper from '../../wrapper/ContractWrapper';
import {
  connectMetaMask,
  formMessage,
  initializeSignProtocolClient,
  createSchema,
  createAttestation,
  queryAttestations
} from "../../wrapper/SignProtocol";

function OfferForm({ nftDetails, buyerAddress, sellerAddress }) {
  const [key] = useState(() => Math.floor(Math.random() * 10000));
  const [timestamp] = useState(() => Date.now());
  const [offerCurrencies, setOfferCurrencies] = useState([{ amount: '', currency: '' }]);
  const [isPublic, setIsPublic] = useState(false); // State for "Open to Public"

  // Hardcoded token address map
  const tokenAddressMap = {
    BTC: '0x1234567890abcdef1234567890abcdef12345678', // Replace with actual token address
    PEPE: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Replace with actual token address
    DOGE: '0x9876543210abcdef9876543210abcdef98765432', // Replace with actual token address
    ETH: null, // No token address required for ETH
  };

  const contractWrapper = new ContractWrapper();

  const handleCurrencyChange = (index, field, value) => {
    const updatedCurrencies = [...offerCurrencies];
    updatedCurrencies[index][field] = value;
    setOfferCurrencies(updatedCurrencies);
  };

  const handleAddCurrency = () => {
    setOfferCurrencies([...offerCurrencies, { amount: '', currency: '' }]);
  };

  const handleCreateOffer = async () => {
    console.log('Creating offer with the following details:', {
      nftDetails,
      offerCurrencies,
      isPublic, // Include public visibility status
    });

    buyerAddress = buyerAddress.trim();
    sellerAddress = sellerAddress.trim();
    console.log(buyerAddress, sellerAddress)
    try {
      let vaultTransactionId = await contractWrapper.createTransaction(sellerAddress, sellerAddress, buyerAddress);
      console.log(vaultTransactionId);
      for (const offer of offerCurrencies) {
        const { amount, currency } = offer;

        if (!amount || !currency) {
          alert('Each currency must have an amount and a valid currency selected.');
          return;
        }

        const tokenAddress = tokenAddressMap[currency];
        if (!tokenAddress && currency !== 'ETH') {
          alert(`Token address for ${currency} is not defined.`);
          return;
        }

        if (currency === 'ETH') {
          console.log(`Processing ETH deposit of ${amount}`);
          // Add ETH deposit logic here
          await contractWrapper.depositETH(vaultTransactionId, amount, buyerAddress)

        } else {
          console.log(`Processing ${currency} deposit of ${amount} at token address ${tokenAddress}`);
          try {
            await contractWrapper.depositERC20(vaultTransactionId, tokenAddress, parseInt(amount), buyerAddress);
          } catch (error) {
            console.error(`Error processing ${currency} deposit:`, error);
          }
        }
      }
      try {
        var message = formMessage(buyerAddress, sellerAddress, key, timestamp);
        const client = initializeSignProtocolClient(message, buyerAddress);
        const schemaId = await createSchema(client);
        const signedMessage = await client.account.signMessage(message);
        console.log(signedMessage)
        // await createAttestation(client, schemaId, buyerAddress, sellerAddress, tokens, signedMessage);
        // queryAttestations(signedMessage)
      } catch (error) {
        console.error("Error creating attestation:", error);
        alert("Failed to create attestation. Check the console for details.");
      }
      

    } catch (ex) {
      console.error('Error:', ex);
      alert('Error:', ex);
    }

    alert('Offer created successfully!');
  };

  const handlePublicCheckboxChange = () => {
    setIsPublic(!isPublic);
    console.log("Public option changed to:", !isPublic);
    // Future implementation for Nillion integration
  };

  return (
    <form className="offer-form">
      <h2>Create Offer</h2>
      <p>Contract Address: {nftDetails.contractAddress}</p>
      <p>Token ID: {nftDetails.tokenId}</p>

      <div className="currency-fields">
        {offerCurrencies.map((currency, index) => (
          <div className="currency-row" key={index}>
            <input
              type="number"
              value={currency.amount}
              onChange={(e) => handleCurrencyChange(index, 'amount', e.target.value)}
              placeholder="Amount"
              required
              className="currency-input"
            />
            <select
              value={currency.currency}
              onChange={(e) => handleCurrencyChange(index, 'currency', e.target.value)}
              required
              className="currency-select"
            >
              <option value="" disabled>
                Select Currency
              </option>
              <option value="BTC">BTC</option>
              <option value="PEPE">PEPE</option>
              <option value="DOGE">DOGE</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAddCurrency} className="add-currency-button">
        Add Currency
      </button>

      <label className="public-checkbox">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={handlePublicCheckboxChange}
        />
        Open to Public
      </label>

      <button type="button" onClick={handleCreateOffer} className="create-offer-button">
        Create Offer
      </button>
    </form>
  );
}

export default OfferForm;
