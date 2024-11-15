import React from 'react';

function NFTList({ nfts, onNFTSelect, isSeller }) {
  return (
    <div className="nft-list">
      <h3>{isSeller ? 'Seller NFTs' : 'Your NFTs'}</h3>
      {nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft, index) => (
            <div
              className={`nft-item ${isSeller ? 'clickable' : ''}`}
              key={index}
              onClick={() => isSeller && onNFTSelect(nft.contractAddress, nft.tokenId)}
              style={isSeller ? { cursor: 'pointer' } : {}}
            >
              <div className="nft-thumbnail-container">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="nft-thumbnail" />
                ) : (
                  <div className="nft-placeholder">No Image</div>
                )}
              </div>
              <div className="nft-details">
                <p className="nft-name">{nft.name || 'Unnamed NFT'}</p>
                <p className="nft-tokenId">Token ID: {nft.tokenId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NFTList;
