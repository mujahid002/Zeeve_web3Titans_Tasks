// Import required packages
import * as bip39 from "bip39";
import pkg from "ethereumjs-wallet";
const { hdkey } = pkg;

import Web3 from "web3";
import { config } from "dotenv";

// Load environment variables from a .env file
config();

// Function to generate a random mnemonic
const generateMnemonic = async () => {
  // Generate a new mnemonic
  const mnemonic = bip39.generateMnemonic();
  // Derive a seed from the mnemonic
  const seed = await bip39.mnemonicToSeed(mnemonic);
  // Derive entropy from the mnemonic
  const entropy = bip39.mnemonicToEntropy(mnemonic);
  // Reconstruct the mnemonic from the entropy
  const mnemonic1 = bip39.entropyToMnemonic(entropy);

  // Log the generated values
  console.log({ mnemonic, mnemonic1, seed: seed.toString("hex"), entropy });
};

// Function to generate Ethereum wallets
const generateWallets = async (count = 1) => {
  // Retrieve the mnemonic from an environment variable
  const mnemonic = process.env.MY_MNEMONIC;
  const seed = (await bip39.mnemonicToSeed(mnemonic)).toString("hex");
  const masterWallet = hdkey.fromMasterSeed(Buffer.from(seed, "hex"));

  // Log the private and public keys of the master wallet
  console.log(masterWallet.getWallet().getPrivateKeyString());
  console.log(masterWallet.getWallet().getPublicKeyString());

  const hdPath = `m/44'/60'/0'/0/`;

  // Generate and log derived wallets
  for (let index = 0; index < count; index++) {
    const wallet = masterWallet.derivePath(hdPath + index).getWallet();
    const pri = wallet.getPrivateKeyString();
    const pub = wallet.getPublicKeyString();
    const add = wallet.getAddressString();
    console.log({ pri, pub, add });
  }
};

// Function to create and send an Ethereum transaction
const createTransaction = async (
  fromAddress,
  toAddress,
  transferEtherAmount,
  senderPrivateKey
) => {
  // Initialize a Web3 instance with Alchemy Ethereum node
    const providerUrl = 
            `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`;

    // web3.js is running with provider
    const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

  // Get the current gas price
  const gasPrice = await web3.eth.getGasPrice();

  // Set the gas limit for the transaction
  const gasLimit = 2000000;

  // Get the nonce (number of transactions sent) for the sender address
  const nonce = await web3.eth.getTransactionCount(fromAddress, "pending");

  // Get the current chain ID
  const chainId = await web3.eth.getChainId();

  // Convert the transfer amount to wei
  const convertedAmount = web3.utils.toWei(
    transferEtherAmount.toString(),
    "ether"
  );

  // Log transaction details
  console.log({ gasPrice, nonce, chainId, convertedAmount });

  // Create a raw transaction and sign it with the sender's private key
  const { rawTransaction } = await web3.eth.accounts.signTransaction(
    {
      to: toAddress,
      value: convertedAmount,
      gasPrice,
      gas: gasLimit,
      nonce,
      chainId,
    },
    senderPrivateKey
  );

  // Log the raw transaction
  console.log({ rawTransaction });

  // Send the signed transaction and get transaction details
  const txnDetails = await web3.eth.sendSignedTransaction(rawTransaction);

  // Log the transaction details
  console.log(txnDetails);
};
// generateMnemonic(1);

// generateWallets(2);

// use your own addresses and private key for the transactions

// createTransaction("0x709d29dc073F42feF70B6aa751A8D186425b2750", "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5", 0.1, `${process.env.SENDER_PRIVATE_KEY}`);



/**
 * Reference: https://sepolia.etherscan.io/address/0x709d29dc073F42feF70B6aa751A8D186425b2750
 */