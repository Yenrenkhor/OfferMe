// ContractWrapper.js
import Web3 from 'web3';
import VaultContractABI from './VaultContractABI.json';
import TradeContractABI from './TradeContractABI.json';

class ContractWrapper {
  constructor() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      this.vaultContract = new this.web3.eth.Contract(
        VaultContractABI,
        '0x35b7a6633a94cf18b1fabe46fc3048d5dccc1f1d'
      );
      this.tradeContract = new this.web3.eth.Contract(
        TradeContractABI,
        '0x5e74e8799c60cad060572e99b6c93ffc8a2155da'
      );
    } else {
      throw new Error('MetaMask is not installed');
    }
  }

  // ============ Transaction ============
  async createTransaction(seller, approver, buyerAddress) {
    const tx = await this.vaultContract.methods.createTransaction(seller, approver).send({
      from: buyerAddress,
      gas: 5000000,
    });
    console.log('Transaction Created:', tx.events.RolesAssigned.returnValues.transactionId);
    return tx.events.RolesAssigned.returnValues.transactionId;
  }

  async depositETH(transactionId, amount, buyerAddress) {
    var etherValue = this.web3.utils.toWei(amount, 'ether')
    console.log(etherValue);
    const tx = await this.vaultContract.methods.depositETH(transactionId).send({
      from: buyerAddress,
      value: etherValue,
      gas: 1000000,
    });
    console.log('ETH Deposited:', tx);
    return tx;
  }

  async depositERC20(transactionId, tokenAddress, amount, buyerAddress) {
    const tokenAmount = this.web3.utils.toWei(amount.toString(), 'ether');
    const tx = await this.vaultContract.methods.depositERC20(transactionId, tokenAddress, tokenAmount).send({
      from: buyerAddress,
      gas: 200000,
    });
    console.log('ERC20 Deposited:', tx);
    return tx;
  }

  async approveTransaction(transactionId, approverAddress) {
    const tx = await this.vaultContract.methods.approve(transactionId).send({
      from: approverAddress,
      gas: 100000,
    });
    console.log('Transaction Approved:', tx);
    return tx;
  }

  async rejectTransaction(transactionId, approverAddress) {
    const tx = await this.vaultContract.methods.reject(transactionId).send({
      from: approverAddress,
      gas: 100000,
    });
    console.log('Transaction Rejected:', tx);
    return tx;
  }

  async cancelTransaction(transactionId, buyerAddress) {
    const tx = await this.vaultContract.methods.cancel(transactionId).send({
      from: buyerAddress,
      gas: 100000,
    });
    console.log('Transaction Cancelled:', tx);
    return tx;
  }

  async claimAfterExpiry(transactionId, buyerAddress) {
    const tx = await this.vaultContract.methods.claimAfterExpiry(transactionId).send({
      from: buyerAddress,
      gas: 100000,
    });
    console.log('Funds Claimed After Expiry:', tx);
    return tx;
  }

  // ============ Trade ============
  async createTrade(nftContractAddress, buyerAddress, tokenId, sellerAddress) {
    const tx = await this.tradeContract.methods.createTrade(nftContractAddress, buyerAddress, tokenId).send({
      from: sellerAddress,
    });
    console.log('Trade Created:', tx.events.TradeCreated.returnValues);
    return tx.events.TradeCreated.returnValues;
  }

  async approveNFTTransfer(nftContractAddress, tokenId, sellerAddress) {
    const nftContract = new this.web3.eth.Contract([{ constant: true, inputs: [{ name: 'approved', type: 'address' }], name: 'approve', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }], nftContractAddress);
    const tx = await nftContract.methods.approve(this.tradeContract.options.address, tokenId).send({
      from: sellerAddress,
    });
    console.log('NFT Transfer Approved:', tx);
    return tx;
  }

  async approveTrade(tradeId, tokenId, tradePrice, buyerAddress) {
    const tx = await this.tradeContract.methods.approveTrade(tradeId, tokenId).send({
      from: buyerAddress,
      value: tradePrice, // Trade price in Wei
    });
    console.log('Trade Approved:', tx.events.TradeApproved.returnValues);
    return tx.events.TradeApproved.returnValues;
  }

  async rejectTrade(tradeId, tokenId, sellerAddress) {
    const tx = await this.tradeContract.methods.rejectTrade(tradeId, tokenId).send({
      from: sellerAddress,
    });
    console.log('Trade Rejected:', tx.events.TradeRejected.returnValues);
    return tx.events.TradeRejected.returnValues;
  }
}

export default ContractWrapper;
