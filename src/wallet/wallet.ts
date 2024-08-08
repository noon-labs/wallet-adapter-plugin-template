import {
  Account,
  AccountAuthenticator,
  AnyRawTransaction,
  Aptos,
  AptosConfig,
  SigningScheme,
} from "@aptos-labs/ts-sdk";
import {
  AccountInfo,
  AptosConnectMethod,
  AptosDisconnectMethod,
  AptosGetAccountMethod,
  AptosGetNetworkMethod,
  AptosOnAccountChangeMethod,
  AptosSignMessageInput,
  AptosSignMessageMethod,
  AptosSignMessageOutput,
  AptosSignTransactionMethod,
  AptosWallet,
  IdentifierArray,
  NetworkInfo,
  UserResponse,
  AptosWalletAccount,
  AptosOnNetworkChangeMethod,
  AptosFeatures,
  UserResponseStatus,
  AptosSignAndSubmitTransactionMethod,
  AptosSignAndSubmitTransactionInput,
  AptosSignAndSubmitTransactionOutput,
  AptosOnAccountChangeInput,
  AptosOnNetworkChangeInput,
  AptosConnectInput,
  APTOS_TESTNET_CHAIN,
  APTOS_MAINNET_CHAIN,
} from "@aptos-labs/wallet-standard";

interface LunchWindow extends Window {
  aptosWebView?: AptosWebView;
}
declare const window: LunchWindow;

interface AptosWebView {
  getAptosMnemonics: () => Promise<string>;
  getAptosRestUrl: () => Promise<string>;
  getAptosFaucetUrl: () => Promise<string>;
  aptosTransactionSubmitted: (hash: string) => void;
  handleResponse: (id: number, result: string) => void;
  handleError: (id: number, error: any) => void;
  callbacks: { [key: number]: (error: any, data: any) => void };
}

const LUNCH_ICON =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyODdfMTM0MzEpIj4KPHBhdGggZD0iTTMyLjAwMDIgMEgwLjAwMDI0NDE0MVYzMkgzMi4wMDAyVjBaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTI4N18xMzQzMSkiLz4KPHBhdGggZD0iTTE4LjEzMzcgMjguMDY1NEMxMi43MTIyIDI4LjA2NTQgOC45Mjg2OCAyNC41MDI0IDguOTI4NjggMTkuMzk5NEM4LjkyODY4IDEzLjM3MjQgMTIuMzcyNyA3LjEzNTQxIDE4LjEzMzcgNy4xMzU0MUMyMy44OTQ3IDcuMTM1NDEgMjcuMzM4NyAxMy4zNzI0IDI3LjMzODcgMTkuMzk5NEMyNy4zMzg3IDI0LjUwMjQgMjMuNTU1MiAyOC4wNjU0IDE4LjEzMzcgMjguMDY1NFoiIGZpbGw9ImJsYWNrIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMV8xMjg3XzEzNDMxKSI+CjxwYXRoIGQ9Ik0xNi4wMDAzIDI1LjkzMkMxMC41Nzg4IDI1LjkzMiA2Ljc5NTMyIDIyLjM2OSA2Ljc5NTMyIDE3LjI2NkM2Ljc5NTMyIDExLjIzOSAxMC4yMzkzIDUuMDAyMDEgMTYuMDAwMyA1LjAwMjAxQzIxLjc2MTMgNS4wMDIwMSAyNS4yMDUzIDExLjIzOSAyNS4yMDUzIDE3LjI2NkMyNS4yMDUzIDIyLjM2OSAyMS40MjE4IDI1LjkzMiAxNi4wMDAzIDI1LjkzMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMC44MzQ0IDEwLjA2OTVDMTkuOTEwNCA4Ljc0OTk5IDE4LjM1MjkgNy4yNzY0OSAxNi4wMDA5IDcuMjc2NDlWMTUuNDY2NUwyMC44MzQ0IDEwLjA2OTVaIiBmaWxsPSIjRkY5NjNCIi8+CjxwYXRoIGQ9Ik0xNi4wMDA3IDcuMjc2NDlDMTMuNjQ4NyA3LjI3NjQ5IDEyLjA5MTIgOC43NDk5OSAxMS4xNjcyIDEwLjA2OTVMMTYuMDAwNyAxNS40NjY1VjcuMjc2NDlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTEuMTY3IDEwLjA3MDZDMTEuMTIxNSAxMC4xMzcxIDExLjA3NiAxMC4yMDAxIDExLjAzNCAxMC4yNjMxQzEwLjMyNyAxMS4zMzA2IDkuNzk4NDUgMTIuNjE4NiA5LjQ2NTk1IDEzLjk5NzZMMTYuMDA0IDE1LjQ2NDFMMTEuMTcwNSAxMC4wNjcxTDExLjE2NyAxMC4wNzA2WiIgZmlsbD0iI0ZGREUwMCIvPgo8cGF0aCBkPSJNOS40NjI4NyAxNC4wMDA1QzkuMjEwODcgMTUuMDUwNSA5LjA3MDg3IDE2LjE1NjUgOS4wNzA4NyAxNy4yNjZDOS4wNzA4NyAxNy43ODc1IDkuMTI2ODcgMTguMjg0NSA5LjIyODM3IDE4Ljc1N0wxNi4wMDA5IDE1LjQ2N0w5LjQ2Mjg3IDE0LjAwMDVaIiBmaWxsPSIjRkFCQzAwIi8+CjxwYXRoIGQ9Ik0xMS41MzQ5IDIyLjMzOUMxMi43MDA0IDIzLjE3OSAxNC4yMjI5IDIzLjY1NSAxNi4wMDA5IDIzLjY1NVYxNS40NjVMMTEuNTM0OSAyMi4zMzlaIiBmaWxsPSIjRkY5NjNCIi8+CjxwYXRoIGQ9Ik0xNi4wMDA4IDIzLjY1NUMxNy43Nzg4IDIzLjY1NSAxOS4zMDEzIDIzLjE3OSAyMC40NjY4IDIyLjMzOUwxNi4wMDA4IDE1LjQ2NVYyMy42NTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAuNDY2OCAyMi4zMzlDMjEuNjQ2MyAyMS40ODUgMjIuNDU0OCAyMC4yNTY1IDIyLjc3MzMgMTguNzU1TDE2LjAwMDggMTUuNDY1TDIwLjQ2NjggMjIuMzM5WiIgZmlsbD0iI0ZBQkMwMCIvPgo8cGF0aCBkPSJNMjIuNzczMyAxOC43NTdDMjIuODc0OCAxOC4yODQ1IDIyLjkzMDggMTcuNzg3NSAyMi45MzA4IDE3LjI2NkMyMi45MzA4IDE2LjE1NjUgMjIuNzkwOCAxNS4wNTA1IDIyLjUzODggMTQuMDAwNUwxNi4wMDA4IDE1LjQ2N0wyMi43NzMzIDE4Ljc1N1oiIGZpbGw9IiNGQUJDMDAiLz4KPHBhdGggZD0iTTIwLjgzNDMgMTAuMDcxM0wxNi4wMDA4IDE1LjQ2ODNMMjIuNTM4OCAxNC4wMDE4QzIyLjIwNjMgMTIuNjIyOCAyMS42Nzc4IDExLjMzNDggMjAuOTcwOCAxMC4yNjczQzIwLjkyODggMTAuMjA0MyAyMC44ODMzIDEwLjEzNzggMjAuODM3OCAxMC4wNzQ4TDIwLjgzNDMgMTAuMDcxM1oiIGZpbGw9IiNGRjc5MDAiLz4KPHBhdGggZD0iTTkuMjI5NDcgMTguNzU1QzkuNTQ3OTcgMjAuMjU2NSAxMC4zNTY1IDIxLjQ4ODUgMTEuNTM2IDIyLjMzOUwxNi4wMDIgMTUuNDY1TDkuMjI5NDcgMTguNzU1WiIgZmlsbD0iI0ZGNzkwMCIvPgo8cGF0aCBkPSJNMTUuOTk5MiAyMS4wNjc2QzEzLjMyMTcgMjEuMDY3NiAxMS42NTkyIDE5LjYxMTYgMTEuNjU5MiAxNy4yNjY2QzExLjY1OTIgMTMuNzA3MSAxMy4zMTgyIDkuODY3NjUgMTUuOTk5MiA5Ljg2NzY1QzE4LjY4MDIgOS44Njc2NSAyMC4zMzkyIDEzLjcwNzEgMjAuMzM5MiAxNy4yNjY2QzIwLjMzOTIgMTkuNjExNiAxOC42NzY3IDIxLjA2NzYgMTUuOTk5MiAyMS4wNjc2WiIgZmlsbD0iI0ZGREUwMCIvPgo8L2c+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMjg3XzEzNDMxIiB4MT0iMTYuMDAwMiIgeTE9IjAiIHgyPSIxNi4wMDAyIiB5Mj0iMzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwNTJDRCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDBBNjgiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMjg3XzEzNDMxIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8Y2xpcFBhdGggaWQ9ImNsaXAxXzEyODdfMTM0MzEiPgo8cmVjdCB3aWR0aD0iMjIuNCIgaGVpZ2h0PSIyMi40IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNC43OTk5OSA0LjI2NjY2KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";
export class LunchAptosWalletAccount implements AptosWalletAccount {
  address: string;
  publicKey: Uint8Array;
  chains = [APTOS_TESTNET_CHAIN, APTOS_MAINNET_CHAIN] as IdentifierArray;
  features: IdentifierArray = [
    "aptos:connect",
    "aptos:network",
    "aptos:changeNetwork",
    "aptos:disconnect",
    "aptos:signAndSubmitTransaction",
    "aptos:signTransaction",
    "aptos:signMessage",
    "aptos:onAccountChange",
    "aptos:onNetworkChange",
    "aptos:account",
  ];
  signingScheme: SigningScheme = SigningScheme.Ed25519;
  label?: string;
  icon?:
    | `data:image/svg+xml;base64,${string}`
    | `data:image/webp;base64,${string}`
    | `data:image/png;base64,${string}`
    | `data:image/gif;base64,${string}`
    | undefined;

  constructor(account: Account) {
    this.address = account.accountAddress.toString();
    this.publicKey = account.publicKey.toUint8Array();
    this.signingScheme = account.signingScheme;
    this.icon = LUNCH_ICON;
  }
}

export class AptosStandard implements AptosWallet {
  provider: AptosWebView | undefined;

  readonly url: string = "https://lunchlunch.xyz";
  readonly version = "1.0.0";
  readonly name: string = "Razor Wallet";
  readonly icon = LUNCH_ICON;

  chains = [APTOS_TESTNET_CHAIN, APTOS_MAINNET_CHAIN] as IdentifierArray;
  accounts: LunchAptosWalletAccount[] = [];

  signer: Account | undefined;
  aptos: Aptos | undefined;

  get features(): AptosFeatures {
    return {
      "aptos:connect": {
        version: "1.0.0",
        connect: this.connect,
      },
      "aptos:disconnect": {
        version: "1.0.0",
        disconnect: this.disconnect,
      },
      "aptos:network": {
        version: "1.0.0",
        network: this.network,
      },
      "aptos:signTransaction": {
        version: "1.0.0",
        signTransaction: this.signTransaction,
      },
      "aptos:signAndSubmitTransaction": {
        version: "1.1.0",
        signAndSubmitTransaction: this.signAndSubmitTransaction,
      },
      "aptos:signMessage": {
        version: "1.0.0",
        signMessage: this.signMessage,
      },
      "aptos:onAccountChange": {
        version: "1.0.0",
        onAccountChange: this.onAccountChange,
      },
      "aptos:onNetworkChange": {
        version: "1.0.0",
        onNetworkChange: this.onNetworkChange,
      },
      "aptos:account": {
        version: "1.0.0",
        account: this.account,
      },
    };
  }

  constructor() {
    this.provider =
      typeof window !== "undefined" ? window.aptosWebView : undefined;
  }

  async initialize(): Promise<void> {
    console.log("initialize function called");
    const mnemonics = await this.provider?.getAptosMnemonics();
    if (mnemonics === undefined) return;
    this.signer = Account.fromDerivationPath({
      path: "m/44'/637'/0'/0'/0'",
      mnemonic: mnemonics,
    });
    const restUrl = await this.provider?.getAptosRestUrl();
    const faucetUrl = await this.provider?.getAptosFaucetUrl();
    const aptosConfig = new AptosConfig({
      fullnode: restUrl ?? "https://aptos.testnet.suzuka.movementlabs.xyz/v1",
      faucet: faucetUrl ?? "https://faucet.testnet.suzuka.movementlabs.xyz",
    });
    console.log(`rest Url: ${restUrl}`);
    console.log(`faucet Url: ${faucetUrl}`);
    this.aptos = new Aptos(aptosConfig);
    this.accounts = [new LunchAptosWalletAccount(this.signer)];
  }

  account: AptosGetAccountMethod = async (): Promise<AccountInfo> => {
    console.log("account function called");
    if (this.signer === undefined) throw new Error("Empty Signer.");
    const account = new AccountInfo({
      address: this.signer.accountAddress,
      publicKey: this.signer.publicKey,
    });
    return account;
  };

  connect: AptosConnectMethod = async (
    ...args: AptosConnectInput
  ): Promise<UserResponse<AccountInfo>> => {
    console.log("connect function called");
    console.log(args);
    try {
      if (this.signer === undefined) throw new Error("Empty Signer.");
      const account = new AccountInfo({
        address: this.signer.accountAddress,
        publicKey: this.signer.publicKey,
      });
      return {
        status: UserResponseStatus.APPROVED,
        args: account,
      };
    } catch (e) {
      return {
        status: UserResponseStatus.REJECTED,
      };
    }
  };

  network: AptosGetNetworkMethod = async (): Promise<NetworkInfo> => {
    console.log("network function called");
    if (this.aptos === undefined) throw new Error("Empty Aptos.");
    const network = await this.aptos.getLedgerInfo();
    return {
      name: this.aptos.config.network,
      chainId: network.chain_id,
      url: this.aptos.config.fullnode,
    };
  };

  disconnect: AptosDisconnectMethod = async (): Promise<void> => {
    console.log("disconnect function called");
    this.accounts = [];
    return Promise.resolve();
  };

  signAndSubmitTransaction: AptosSignAndSubmitTransactionMethod = async (
    transaction: AptosSignAndSubmitTransactionInput
  ): Promise<UserResponse<AptosSignAndSubmitTransactionOutput>> => {
    console.log("signAndSubmitTransaction function called");

    if (this.aptos === undefined || this.signer === undefined) {
      return Promise.resolve({
        status: UserResponseStatus.REJECTED,
      });
    }
    try {
      console.log("Try");
      const tx = await this.aptos.transaction.build.simple({
        sender: this.signer.accountAddress,
        data: transaction.payload,
        options: {
          gasUnitPrice: transaction.gasUnitPrice,
          maxGasAmount: transaction.maxGasAmount,
        },
      });
      console.log("Tx Generated");
      const committedTransaction = await this.aptos.signAndSubmitTransaction({
        signer: this.signer,
        transaction: tx,
      });
      console.log("After sign and submit");
      this.provider?.aptosTransactionSubmitted(committedTransaction.hash);

      await this.aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      console.log("wait done");
      return Promise.resolve({
        status: UserResponseStatus.APPROVED,
        args: {
          hash: committedTransaction.hash,
        },
      });
    } catch {
      return Promise.resolve({
        status: UserResponseStatus.REJECTED,
      });
    }
  };

  signTransaction: AptosSignTransactionMethod = async (
    transaction: AnyRawTransaction,
    asFeePayer?: boolean
  ): Promise<UserResponse<AccountAuthenticator>> => {
    console.log("signTransaction function called");
    if (this.aptos === undefined || this.signer === undefined) {
      return Promise.resolve({
        status: UserResponseStatus.REJECTED,
      });
    }

    if (asFeePayer) {
      const senderAuthenticator = this.aptos.transaction.signAsFeePayer({
        signer: this.signer,
        transaction,
      });
      return Promise.resolve({
        status: UserResponseStatus.APPROVED,
        args: senderAuthenticator,
      });
    }
    const senderAuthenticator = this.aptos.transaction.sign({
      signer: this.signer,
      transaction,
    });
    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: senderAuthenticator,
    });
  };

  signMessage: AptosSignMessageMethod = async (
    input: AptosSignMessageInput
  ): Promise<UserResponse<AptosSignMessageOutput>> => {
    console.log("signMessage function called");
    if (this.signer === undefined) {
      return Promise.resolve({
        status: UserResponseStatus.REJECTED,
      });
    }
    // 'Aptos' + application + address + nonce + chainId + message
    const messageToSign = `Aptos
      LunchLunch
      ${this.signer.accountAddress.toString()}
      ${input.nonce}
      ${input.chainId ?? (await this.network()).chainId}
      ${input.message}`;

    const encodedMessageToSign = new TextEncoder().encode(messageToSign);

    const signature = this.signer.sign(encodedMessageToSign);

    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        address: this.signer.accountAddress.toString(),
        fullMessage: messageToSign,
        message: input.message,
        nonce: input.nonce,
        prefix: "APTOS",
        signature: signature,
      },
    });
  };

  onAccountChange: AptosOnAccountChangeMethod = async (
    input: AptosOnAccountChangeInput
  ): Promise<void> => {
    console.log("onAccountChange function called");
    const accountInfo = await this.account();
    input(accountInfo);
    return Promise.resolve();
  };

  onNetworkChange: AptosOnNetworkChangeMethod = async (
    input: AptosOnNetworkChangeInput
  ): Promise<void> => {
    console.log("onNetworkChange function called");
    const network = await this.network();
    input(network);
    return Promise.resolve();
  };
}
