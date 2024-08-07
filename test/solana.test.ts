import SolanaLib from '../src/index';
import { describe, expect, test } from '@jest/globals';
import * as dotenv from 'dotenv';

dotenv.config();

// variables
const mainTimeout = 14000;

// testData
const testData = {
  publicKey: process.env.MY_PUBLIC_KEY || '461rwYh5yghpEnNsKiUJ2J7UvGysLbPi63dkcrXas3e3',
  privateKey: process.env.MY_PRIVATE_KEY || '44p6YM833EyCc7UsUjsrCEw1XXjYWRgGPQ2aQmDSuhxSjquF2ut4LBHDzbpnrQz8sWG5ZJmxJwHVFqfjK9nQX37h',
  toWalletAddress: process.env.TOWALLETADDRESS || 'HPC9kMWf6DLD6oYW9znD4CGgsJqjAtQ4RnGN5d91wNsg',
  network: process.env.NETWORK || 'testnet',
  crypto: 'SOL',
  amount: 0.5,
  decimals: 6,
  tokenAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', //'4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
};

const keys = {
  sendTransactionResponse: [
    'amount',
    'date',
    'from',
    'gasCostCryptoCurrency',
    'network',
    'nonce',
    'to',
    'transactionHash',
    'transactionLink',
    'transactionReceipt',
  ],
  getTransactionResponse: [
    'date',
    'gasCostCryptoCurrency',
    'gasCostInCrypto',
    'gasLimit',
    'isPending',
    'isExecuted',
    'isSuccessful',
    'isFailed',
    'isInvalid',
    'network',
    'nonce',
    'transactionHash',
    'transactionLink',
  ],
};

const runtime = { transactionHash: '' };

describe('Solana module', () => {
  test(
    'should getBalance',
    async function () {
      const { network, decimals, tokenAddress, publicKey } = testData;

      const result = await SolanaLib.getBalance(
        network,

        publicKey,
        tokenAddress, // token Id
      );

      console.log({ result });
      expect(typeof result).toBe('number');
    },
    mainTimeout,
  );

  test(
    'should isValidWalletAddress',
    async function () {
      const result = await SolanaLib.isValidWalletAddress(testData.toWalletAddress);

      console.log({ result });
      expect(result).toBe(true);
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction',
    async function () {
      const { toWalletAddress: to, network, amount, decimals, privateKey, tokenAddress } = testData;

      const result = await SolanaLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        privateKey,
        tokenAddress,
      });

      console.log({ result });

      runtime.transactionHash = result.receipt.transactionHash;

      expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.sendTransactionResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should getTransaction',
    async function () {
      const { network } = testData;
      const { transactionHash: txnId } = runtime;

      const result = await SolanaLib.getTransaction(
        '5gYzs3rkNFsmdJ4zfkPjfHQ4SU4Er52nzpn3PXqPjH5EuVCKMwjzf9CoR5z392HCxRrT7dZJgFdCjEGceSu6cHSR',
        network,
      );
      console.log(result);

      if (result) expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.getTransactionResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should calculateNetworkFee',
    async function () {
      const { network, publicKey } = testData;

      const result = await SolanaLib.getFeeStats(network, publicKey);

      console.log({ result });
      expect(typeof result.baseFee).toBe('number');
    },
    mainTimeout,
  );
});
