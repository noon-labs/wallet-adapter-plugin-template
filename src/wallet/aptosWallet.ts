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
  AptosChangeNetworkMethod,
  AptosChangeNetworkInput,
  AptosChangeNetworkOutput,
} from "@aptos-labs/wallet-standard";
import { LUNCH_ICON } from "./constants";

interface LunchWindow extends Window {
  aptosWebView?: AptosWebView;
}
declare const window: LunchWindow;

interface AptosWebView {
  getMnemonics: () => Promise<string>;
  getRestUrl: () => Promise<string>;
  getFaucetUrl: () => Promise<string>;
  transactionSubmitted: (hash: string) => void;
  requestCredential: (requestType: string, txOrMessage: string) => Promise<void>;
  handleResponse: (id: number, result: string) => void;
  handleError: (id: number, error: any) => void;
  callbacks: { [key: number]: (error: any, data: any) => void };
}

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
  readonly name: string;
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
      "aptos:changeNetwork": {
        version: "1.0.0",
        changeNetwork: this.changeNetwork,
      },
    };
  }

  constructor(name: string = "Razor Wallet") {
    this.name = name;
    this.provider =
      typeof window !== "undefined" ? window.aptosWebView : undefined;
  }

  async initialize(): Promise<void> {
    console.log("aptos initialize function called");
    const mnemonics = await this.provider?.getMnemonics();
    if (mnemonics === undefined) return;
    this.signer = Account.fromDerivationPath({
      path: "m/44'/637'/0'/0'/0'",
      mnemonic: mnemonics,
    });
    const restUrl = await this.provider?.getRestUrl();
    const faucetUrl = await this.provider?.getFaucetUrl();
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
    
      await this.provider?.requestCredential('Transaction', JSON.stringify(tx,(key, value) => 
        typeof value === 'bigint' ? value.toString() : value));

      console.log("Credential Success");

      const committedTransaction = await this.aptos.signAndSubmitTransaction({
        signer: this.signer,
        transaction: tx,
      });
      console.log("After sign and submit");
      this.provider?.transactionSubmitted(committedTransaction.hash);

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
    } catch(e) {
      console.log(e);
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
    try {

      await this.provider?.requestCredential('Transaction', JSON.stringify(transaction));
    } catch {
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

    try {
      await this.provider?.requestCredential('Signature', JSON.stringify(input));
    } catch {
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

  changeNetwork: AptosChangeNetworkMethod = async (
    input: AptosChangeNetworkInput
  ): Promise<UserResponse<AptosChangeNetworkOutput>> => {
    console.log("changeNetwork function called");
    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        success: true,
      },
    });
  };
}
