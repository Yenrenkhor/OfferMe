import Web3 from 'web3';
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
} from '@ethsign/sp-sdk';

var web3;
var account;
var signedMessage;
const key;

async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed!');
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Initialize Web3
  web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];

  console.log('Connected MetaMask account:', account); // get account mean confirm connected or access the wallet
}

// create message string for sign
function formMessage(buyer, seller, key, timestamp){
	return buyer.concat("_", seller, "_", key, "_", timestamp);
}

function signProtocolClient(message, account){
	const client = new SignProtocolClient(SpMode.OffChain, {
    account: {
      address: account,
      signMessage: async (message) => {
        signedMessage = createSiugnature(message, account)
        console.log('Signed message:', signedMessage);
        return signedMessage;
      },
    },
  });

  return client;
}

// sign the message
async function createSiugnature(message, account){
	var sign = await web3.eth.personal.sign(message, account);
	return sign;
}

//create the schema for sign passing
async function createSchema(client) {
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
		  ]
		}
    ],
  });

  console.log('Schema created:', schemaResponse);
  return schemaResponse.schemaId; // Return schemaId for future operations
}

//token remember form json base on createSchema at tokenDetails [{tokenAddress:'', value:1},{tokenAddress:'', value:2},....]
async function createAttestation(client, schemaId, buyerAddress, sellerAddress, tokens, signedMessage) {
  const attestationResponse = await client.createAttestation({
    schemaId: schemaId,
    data: { buyer: buyerAddress, 
			seller: sellerAddress,
			tokenDetails: tokens
			},
    indexingValue: signedMessage,
  });

  console.log('Attestation created:', attestationResponse);
}

async function queryAttestations(indexingValue) {
  const indexService = new IndexService('testnet'); // mainnet / testnet

  const attestationList = await indexService.queryAttestationList({
    indexingValue: indexingValue, // Unique identifier for attestation
    page: 1, // Pagination control
  });

  console.log('Retrieved Attestations:', attestationList);
  
  return attestationList;
}


