import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionSignature } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';
import { networks } from './config';
import { Network, GetTransactionResult, SendTransactionResult, SendTransactionParams } from './types';

/**
 * Get the network config
 * @param network
 * @returns
 */
const getNetwork = (network: string) => (network === 'main' ? networks[network] : networks.testnet) as Network;

/**
 * Validate the wallet address
 * @param address
 * @returns
 */
const isValidWalletAddress = (address: string) => {
  // validate solana address
  try {
    const key = new PublicKey(address);
    // Lies on the ed25519 curve and is suitable for users
    return PublicKey.isOnCurve(key.toBytes());
  } catch (error) {
    // If decoding fails, the address is not valid``
    return false;
  }
};

/**
 *
 * @param txId
 * @param network
 * @returns
 */
const getTransactionLink = (txId: string, network: string) => getNetwork(network).transactionLink(txId) as string;

/**
 * get wallet link for the given address
 * @param walletAddress
 * @param network
 * @returns
 */
const getWalletLink = (walletAddress: string, network: string) => getNetwork(network).walletLink(walletAddress) as string;

/**
 * create a client instance
 * @param network
 * @returns
 */
async function getConnection(network: string): Promise<any> {
  const config = getNetwork(network);

  const connection = new Connection(config.networkUrl);
  return connection;
}

/**
 * Get the balance of the transak wallet address
 * @param network
 * @param privateKey
 * @param tokenAddress // tokenAddress
 * @returns
 */
async function getBalance(network: string, publicKey: string, tokenAddress?: string): Promise<number> {
  const connection = await getConnection(network);

  if (tokenAddress) {
    // get token account for the given public key
    const owner = new PublicKey(publicKey);
    const token = new PublicKey(tokenAddress);

    const ata = await connection.getParsedTokenAccountsByOwner(owner, {
      mint: token,
    });

    const { amount, decimals } = ata.value[0].account.data.parsed.info.tokenAmount;

    return Number(amount / 10 ** decimals);
  }

  const _publicKey = new PublicKey(publicKey);
  const solBalance = await connection.getBalance(_publicKey);
  return Number(solBalance / LAMPORTS_PER_SOL);
}

/**
 * Get the transaction details by transaction id
 * @param txnId
 * @param network
 * @returns
 */
async function getTransaction(txnId: string, network: string): Promise<GetTransactionResult | null> {
  try {
    const connection = await getConnection(network);

    // Fetch the transaction details
    const transactionSignature: TransactionSignature = txnId;
    const transactionData = await connection.getTransaction(transactionSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!transactionData) {
      console.log('Transaction not found');
      return null;
    }

    console.log(transactionData);

    return {
      transactionData,
      receipt: {
        from: transactionData.transaction.message?.accountKeys?.[0]?.toString() || '',
        date: transactionData.blockTime,
        gasCostCryptoCurrency: 'SOL',
        gasCostInCrypto: transactionData.meta.fee,
        gasLimit: transactionData.meta.computeUnitsConsumed,
        isPending: false,
        isExecuted: true,
        isSuccessful: transactionData.meta.status.hasOwnProperty('Ok'),
        isFailed: transactionData.meta.status.hasOwnProperty('Err'),
        isInvalid: false,
        network,
        nonce: transactionData.transaction.nonceInfo || 0,
        transactionHash: txnId,
        transactionLink: getTransactionLink(txnId, network),
      },
    };
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return null;
  }
}

/**
 * Send the transaction to the Solana network
 * @param param0
 * @returns
 */
async function sendTransaction({ to, amount, network, privateKey, decimals, tokenAddress }: SendTransactionParams): Promise<SendTransactionResult> {
  const connection = await getConnection(network);
  const senderKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  const fromPublicKey = senderKeypair.publicKey;
  const toPublicKey = new PublicKey(to);
  let transferInstruction = null;

  // SPL token transfer
  if (tokenAddress) {
    const token = new PublicKey(tokenAddress);
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(connection, senderKeypair, token, fromPublicKey);
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(connection, senderKeypair, token, toPublicKey);
    const amountInsmallestUnits = amount * 10 ** decimals;

    transferInstruction = createTransferInstruction(
      senderTokenAccount.address,
      recipientTokenAccount.address,
      fromPublicKey,
      amountInsmallestUnits,
      [senderKeypair],
      TOKEN_PROGRAM_ID,
    );
  } else {
    // SOL transfer
    const amountInLamports = amount * LAMPORTS_PER_SOL;
    transferInstruction = SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: amountInLamports,
    });
  }

  // Create a new transaction
  const transaction = new Transaction().add(transferInstruction);

  // Sign and send the transaction
  const signature = await connection.sendTransaction(transaction, [senderKeypair]);
  const receipt = await connection.confirmTransaction(signature, 'confirmed');
  console.log('receipt: ', receipt);

  return {
    transactionData: { signature },
    receipt: {
      amount,
      date: null,
      from: fromPublicKey.toBase58(),
      gasCostCryptoCurrency: 'SOL',
      transactionReceipt: receipt,
      network,
      nonce: 0,
      to,
      transactionHash: signature,
      transactionLink: getTransactionLink(signature, network),
    },
  };
}

export = {
  getTransactionLink,
  getWalletLink,
  getTransaction,
  isValidWalletAddress,
  sendTransaction,
  getBalance,
};
