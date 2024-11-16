import Web3 from 'web3';
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  IndexService,
} from '@ethsign/sp-sdk';

let web3;
let account;

// Initialize MetaMask and connect the wallet
export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed!');
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Initialize Web3
  web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];

  console.log('Connected MetaMask account:', account);
  return account;
};

// Create a message string for signing
export const formMessage = (buyer, seller, key, timestamp) => {
  return `${buyer}_${seller}_${key}_${timestamp}`;
};

// Create a SignProtocolClient instance
export const initializeSignProtocolClient = (message, account) => {
  const client = new SignProtocolClient(SpMode.OffChain, {
    account: {
      address: account,
      signMessage: async (message) => {
        const signedMessage = await createSignature(message, account);
        console.log('Signed message:', signedMessage);
        return signedMessage;
      },
    },
  });

  return client;
};

// Sign a message using MetaMask
export const createSignature = async (message, account) => {
  const signedMessage = await web3.eth.personal.sign(message, account);
  return signedMessage;
};

// Create a schema for signing
export const createSchema = async (client) => {
  const schemaResponse = await client.createSchema({
    name: 'Sign_Schema',
    data: [
      { name: 'buyer', type: 'string' },
      { name: 'seller', type: 'string' },
      {
        name: 'tokenDetails',
        type: 'tuple[]',
        components: [
          { name: 'tokenAddress', type: 'string' },
          { name: 'value', type: 'uint256' },
          { name: 'chainId', type: 'uint256' },
        ],
      },
    ],
  });

  console.log('Schema created:', schemaResponse);
  return schemaResponse.schemaId;
};

// Create an attestation
export const createAttestation = async (client, schemaId, buyerAddress, sellerAddress, tokens, signedMessage) => {
  const attestationResponse = await client.createAttestation({
    schemaId: schemaId,
    data: {
      buyer: buyerAddress,
      seller: sellerAddress,
      tokenDetails: tokens,
    },
    indexingValue: signedMessage,
  });

  console.log('Attestation created:', attestationResponse);
};

// Query attestations
export const queryAttestations = async (indexingValue) => {
  const indexService = new IndexService('testnet'); // Use 'mainnet' for production

  const attestationList = await indexService.queryAttestationList({
    indexingValue, // Unique identifier for the attestation
    page: 1, // Pagination control
  });

  console.log('Retrieved Attestations:', attestationList);
  return attestationList;
};
