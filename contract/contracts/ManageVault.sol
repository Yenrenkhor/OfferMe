// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    struct Transaction {
        address buyer;
        address seller;
        address approver;
        uint256 ethBalance;
        mapping(address => uint256) erc20Balances;
        address[] depositedTokens;
        uint256 depositTimestamp;
        bool isLocked;
        bool isApproved;
    }

    mapping(uint256 => Transaction) private transactions;
    uint256 public transactionCount;

    event RolesAssigned(uint256 indexed transactionId, address indexed buyer, address indexed seller, address approver);
    event Deposited(uint256 indexed transactionId, address indexed token, address indexed from, uint256 amount);
    event Approved(uint256 indexed transactionId);
    event Rejected(uint256 indexed transactionId);
    event Expired(uint256 indexed transactionId);
    event Cancelled(uint256 indexed transactionId);
    event FundsTransferred(uint256 indexed transactionId, address indexed to, uint256 amount);
    event TokensTransferred(uint256 indexed transactionId, address indexed token, address indexed to, uint256 amount);

    uint256 public constant EXPIRY_DURATION = 1 days;

    modifier onlyBuyer(uint256 transactionId) {
        require(msg.sender == transactions[transactionId].buyer, "Not the buyer");
        _;
    }

    modifier onlyApprover(uint256 transactionId) {
        require(msg.sender == transactions[transactionId].approver, "Not the approver");
        _;
    }

    modifier transactionExists(uint256 transactionId) {
        require(transactions[transactionId].buyer != address(0), "Transaction does not exist");
        _;
    }

    function createTransaction(address _seller, address _approver) external returns (uint256) {
        uint256 transactionId = ++transactionCount;

        Transaction storage txn = transactions[transactionId];
        txn.buyer = msg.sender;
        txn.seller = _seller;
        txn.approver = _approver;
        txn.isLocked = false;
        txn.isApproved = false;

        emit RolesAssigned(transactionId, txn.buyer, txn.seller, txn.approver);

        return transactionId;
    }

    function depositETH(uint256 transactionId) external payable transactionExists(transactionId) onlyBuyer(transactionId) nonReentrant {
        Transaction storage txn = transactions[transactionId];
        require(!txn.isLocked, "Vault is locked");
        require(msg.value > 0, "No ETH sent");

        txn.ethBalance += msg.value;
        txn.isLocked = true;
        txn.depositTimestamp = block.timestamp;

        emit Deposited(transactionId, address(0), msg.sender, msg.value);
    }

    function depositERC20(uint256 transactionId, IERC20 token, uint256 amount) external transactionExists(transactionId) onlyBuyer(transactionId) nonReentrant {
        Transaction storage txn = transactions[transactionId];
        require(!txn.isLocked, "Vault is locked");
        require(amount > 0, "No tokens sent");

        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        if (txn.erc20Balances[address(token)] == 0) {
            txn.depositedTokens.push(address(token));
        }
        txn.erc20Balances[address(token)] += amount;
        txn.isLocked = true;
        txn.depositTimestamp = block.timestamp;

        emit Deposited(transactionId, address(token), msg.sender, amount);
    }

    function approve(uint256 transactionId) external transactionExists(transactionId) onlyApprover(transactionId) nonReentrant {
        Transaction storage txn = transactions[transactionId];
        require(txn.isLocked, "No funds deposited");
        require(block.timestamp <= txn.depositTimestamp + EXPIRY_DURATION, "Deal expired");

        txn.isApproved = true;
        emit Approved(transactionId);
        transferFunds(transactionId);
    }

    function reject(uint256 transactionId) external transactionExists(transactionId) onlyApprover(transactionId) nonReentrant {
        Transaction storage txn = transactions[transactionId];
        require(txn.isLocked, "No funds deposited");

        emit Rejected(transactionId);
        returnFunds(transactionId);
    }

    function cancel(uint256 transactionId) external transactionExists(transactionId) onlyBuyer(transactionId) nonReentrant {
        Transaction storage txn = transactions[transactionId];
        require(txn.isLocked, "No funds deposited");

        emit Cancelled(transactionId);
        returnFunds(transactionId);
    }

    function claimAfterExpiry(uint256 transactionId) external transactionExists(transactionId) onlyBuyer(transactionId) nonReentrant {
        Transaction storage txn = transactions[transactionId];
        require(txn.isLocked, "No funds deposited");
        require(block.timestamp > txn.depositTimestamp + EXPIRY_DURATION, "Approval window still open");

        emit Expired(transactionId);
        returnFunds(transactionId);
    }

    function transferFunds(uint256 transactionId) internal {
        Transaction storage txn = transactions[transactionId];

        if (txn.ethBalance > 0) {
            uint256 amount = txn.ethBalance;
            txn.ethBalance = 0;
            payable(txn.seller).transfer(amount);
            emit FundsTransferred(transactionId, txn.seller, amount);
        }

        for (uint256 i = 0; i < txn.depositedTokens.length; i++) {
            address tokenAddress = txn.depositedTokens[i];
            uint256 amount = txn.erc20Balances[tokenAddress];
            if (amount > 0) {
                txn.erc20Balances[tokenAddress] = 0;
                IERC20(tokenAddress).transfer(txn.seller, amount);
                emit TokensTransferred(transactionId, tokenAddress, txn.seller, amount);
            }
        }

        txn.isLocked = false;
    }

    function returnFunds(uint256 transactionId) internal {
        Transaction storage txn = transactions[transactionId];

        if (txn.ethBalance > 0) {
            uint256 amount = txn.ethBalance;
            txn.ethBalance = 0;
            payable(txn.buyer).transfer(amount);
            emit FundsTransferred(transactionId, txn.buyer, amount);
        }

        for (uint256 i = 0; i < txn.depositedTokens.length; i++) {
            address tokenAddress = txn.depositedTokens[i];
            uint256 amount = txn.erc20Balances[tokenAddress];
            if (amount > 0) {
                txn.erc20Balances[tokenAddress] = 0;
                IERC20(tokenAddress).transfer(txn.buyer, amount);
                emit TokensTransferred(transactionId, tokenAddress, txn.buyer, amount);
            }
        }

        txn.isLocked = false;
    }
}