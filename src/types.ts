export type Network = {
  networkName: string;
  transactionLink: (arg0: string) => string;
  walletLink: (arg0: string) => string;
  networkUrl: string;
};

export type GetTransactionResult = {
  transactionData: any;
  receipt: {
    date: Date | null;
    from: string;
    gasCostCryptoCurrency: string;
    gasCostInCrypto: number;
    gasLimit: number;
    isPending: boolean;
    isExecuted: boolean;
    isSuccessful: boolean;
    isFailed: boolean;
    isInvalid: boolean;
    network: string;
    nonce: number;
    transactionHash: string;
    transactionLink: string;
  };
};

export type SendTransactionParams = {
  to: string;
  amount: number;
  network: string;
  decimals: number;
  privateKey: string;
  tokenAddress?: string;
};

export type SendTransactionResult = {
  transactionData: any;
  receipt: {
    amount: number;
    date: Date | null;
    from: string;
    gasCostCryptoCurrency: string;
    network: string;
    nonce: number;
    to: string;
    transactionHash: string;
    transactionLink: string;
    transactionReceipt: any;
  };
};
