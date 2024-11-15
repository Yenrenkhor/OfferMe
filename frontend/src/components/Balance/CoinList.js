// CoinList.js
import React from 'react';

function CoinList({ coins }) {
  return (
    <div className="coin-list">
      <h3>Token Balances</h3>
      {coins.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <ul>
          {coins.map((coin, index) => (
            <li key={index}>
              {coin.symbol}: {coin.balance.toFixed(4)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CoinList;
