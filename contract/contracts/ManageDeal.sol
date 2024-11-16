// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TradeNFT is ReentrancyGuard {
    struct Trade {
        address seller;
        address buyer;
        address nftContract;
        bool isActive;
    }

    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter;

    event TradeCreated(uint256 tradeId, address indexed seller, address indexed nftContract);
    event TradeApproved(uint256 tradeId, address indexed buyer);
    event TradeRejected(uint256 tradeId);

    function createTrade(address nftContract, address buyer) external nonReentrant {
        trades[tradeCounter] = Trade({
            seller: msg.sender,
            buyer: buyer,
            nftContract: nftContract,
            isActive: true
        });

        emit TradeCreated(tradeCounter, msg.sender, nftContract);
        tradeCounter++;
    }

    function approveTrade(uint256 tradeId, uint256 tokenId) external nonReentrant {
        Trade memory trade = trades[tradeId];
        require(trade.isActive, "Trade is not active");
        require(msg.sender == trade.seller, "Only the seller can approve the trade");

        IERC721(trade.nftContract).transferFrom(address(this), trade.buyer, tokenId);
        trades[tradeId].isActive = false;

        emit TradeApproved(tradeId, trade.buyer);
    }

    function rejectTrade(uint256 tradeId, uint256 tokenId) external nonReentrant {
        Trade memory trade = trades[tradeId];
        require(trade.isActive, "Trade is not active");
        require(msg.sender == trade.seller, "Only the seller can reject the trade");

        IERC721(trade.nftContract).transferFrom(address(this), trade.seller, tokenId);
        trades[tradeId].isActive = false;

        emit TradeRejected(tradeId);
    }
}