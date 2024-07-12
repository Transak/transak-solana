import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: signature => `https://solscan.io/tx/${signature}`,
    walletLink: address => `https://solscan.io/account/${address}`,
    networkUrl: 'https://api.mainnet-beta.solana.com',
    networkName: 'mainnet',
  },
  testnet: {
    transactionLink: signature => `https://solscan.io/tx/${signature}?cluster=devnet`,
    walletLink: address => `https://solscan.io/account/${address}?cluster=devnet`,
    networkName: 'testnet',
    networkUrl: 'https://api.devnet.solana.com', // https://api.testnet.solana.com
  },
};

module.exports = { networks };
