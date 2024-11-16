import React, { useState } from "react";

const OfferForm = ({ nftDetails, buyerAddress, sellerAddress }) => {
  const [offerAmount, setOfferAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Future logic for submitting the offer
    console.log("Offer submitted with details:", {
      nftDetails,
      buyerAddress,
      sellerAddress,
      offerAmount,
      selectedCurrency,
      isPublic,
    });
  };

  const handlePublicCheckboxChange = () => {
    setIsPublic(!isPublic);
    // Future implementation with Nillion
    console.log("Public option changed to:", !isPublic);
  };

  return (
    <form onSubmit={handleSubmit} className="offer-form">
      <h3>Create Offer for Selected NFT</h3>
      <p>NFT Details:</p>
      <p>
        Contract Address: {nftDetails.contractAddress}
        <br />
        Token ID: {nftDetails.tokenId}
      </p>

      <label>
        Offer Amount:
        <input
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          placeholder="Enter offer amount"
          required
        />
      </label>

      <label>
        Currency:
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="DAI">DAI</option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={handlePublicCheckboxChange}
        />
        Open to Public
      </label>

      <button type="submit">Create Offer</button>
    </form>
  );
};

export default OfferForm;
