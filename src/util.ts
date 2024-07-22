import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const convertToLamports = (fee: number):number => fee / LAMPORTS_PER_SOL;
