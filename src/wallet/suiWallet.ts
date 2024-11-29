import {
  IdentifierArray,
  ReadonlyWalletAccount,
  SUI_DEVNET_CHAIN,
  SUI_MAINNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SignedTransaction,
  StandardConnectFeature,
  StandardConnectInput,
  StandardConnectMethod,
  StandardConnectOutput,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEventsFeature,
  StandardEventsOnMethod,
  SuiSignAndExecuteTransactionBlockFeature,
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignAndExecuteTransactionBlockMethod,
  SuiSignAndExecuteTransactionBlockOutput,
  SuiSignAndExecuteTransactionFeature,
  SuiSignAndExecuteTransactionInput,
  SuiSignAndExecuteTransactionMethod,
  SuiSignAndExecuteTransactionOutput,
  SuiSignMessageFeature,
  SuiSignMessageInput,
  SuiSignMessageMethod,
  SuiSignMessageOutput,
  SuiSignPersonalMessageFeature,
  SuiSignPersonalMessageInput,
  SuiSignPersonalMessageMethod,
  SuiSignPersonalMessageOutput,
  SuiSignTransactionBlockFeature,
  SuiSignTransactionBlockInput,
  SuiSignTransactionBlockMethod,
  SuiSignTransactionBlockOutput,
  SuiSignTransactionFeature,
  SuiSignTransactionInput,
  SuiSignTransactionMethod,
  Wallet,
} from "@mysten/wallet-standard";
import { LUNCH_ICON } from "./constants";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { toBase64 } from "@mysten/bcs";

interface LunchWindow extends Window {
  suiWebView?: SuiWebView;
}
declare const window: LunchWindow;

interface SuiWebView {
  getMnemonics: () => Promise<string>;
  getNodeUrl: () => Promise<string>;
  transactionSubmitted: (hash: string) => void;
  transactionSigned: () => void;
  requestCredential: (requestType: string, txOrMessage: string) => Promise<void>;
  handleResponse: (id: number, result: string) => void;
  handleError: (id: number, error: any) => void;
  callbacks: { [key: number]: (error: any, data: any) => void };
}

type Features = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature &
  SuiSignAndExecuteTransactionBlockFeature &
  SuiSignAndExecuteTransactionFeature &
  SuiSignTransactionBlockFeature &
  SuiSignTransactionFeature &
  SuiSignMessageFeature &
  SuiSignPersonalMessageFeature;

enum Feature {
  STANDARD__CONNECT = "standard:connect",
  STANDARD__DISCONNECT = "standard:disconnect",
  STANDARD__EVENTS = "standard:events",
  SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK = "sui:signAndExecuteTransactionBlock",
  SUI__SIGN_AND_EXECUTE_TRANSACTION = "sui:signAndExecuteTransaction",
  SUI__SIGN_TRANSACTION_BLOCK = "sui:signTransactionBlock",
  SUI__SIGN_TRANSACTION = "sui:signTransaction",
  SUI__SIGN_MESSAGE = "sui:signMessage",
  SUI__SIGN_PERSONAL_MESSAGE = "sui:signPersonalMessage",
}

export class SuiStandard implements Wallet {
  provider: SuiWebView | undefined;

  get version() {
    // Return the version of the Wallet Standard this implements (in this case, 1.0.0).
    return "1.0.0" as const;
  }
  get name() {
    return "Lunch Wallet" as const;
  }
  get icon() {
    return LUNCH_ICON as any;
  }
  // Return the Sui chains that your wallet supports.
  get chains() {
    return [
      SUI_DEVNET_CHAIN,
      SUI_TESTNET_CHAIN,
      SUI_MAINNET_CHAIN,
    ] as IdentifierArray;
  }
  accounts: ReadonlyWalletAccount[] = [];

  signer: Ed25519Keypair | undefined;
  sui: SuiClient | undefined;

  get features(): Features {
    return {
      [Feature.STANDARD__CONNECT]: {
        version: "1.0.0",
        connect: this.connect,
      },
      [Feature.STANDARD__DISCONNECT]: {
        version: "1.0.0",
        disconnect: this.disconnect,
      },
      [Feature.STANDARD__EVENTS]: {
        version: "1.0.0",
        on: this.on,
      },
      [Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK]: {
        version: "1.0.0",
        signAndExecuteTransactionBlock: this.signAndExecuteTransactionBlock,
      },
      [Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION]: {
        version: "2.0.0",
        signAndExecuteTransaction: this.signAndExecuteTransaction,
      },
      [Feature.SUI__SIGN_TRANSACTION_BLOCK]: {
        version: "1.0.0",
        signTransactionBlock: this.signTransactionBlock,
      },
      [Feature.SUI__SIGN_TRANSACTION]: {
        version: "2.0.0",
        signTransaction: this.signTransaction,
      },
      [Feature.SUI__SIGN_MESSAGE]: {
        version: "1.0.0",
        signMessage: this.signMessage,
      },
      [Feature.SUI__SIGN_PERSONAL_MESSAGE]: {
        version: "1.0.0",
        signPersonalMessage: this.signPersonalMessage,
      },
    };
  }

  constructor() {
    this.provider =
      typeof window !== "undefined" ? window.suiWebView : undefined;
  }

  async initialize(): Promise<void> {
    console.log("Sui initialize function called");
    const mnemonics = await this.provider?.getMnemonics();
    if (mnemonics === undefined) return;
    this.signer = Ed25519Keypair.deriveKeypair(mnemonics);
    const nodeUrl = await this.provider?.getNodeUrl();
    console.log(`node Url: ${nodeUrl}`);
    if (nodeUrl === undefined) return;
    this.sui = new SuiClient({
      url: nodeUrl,
    });
    this.accounts = [
      new ReadonlyWalletAccount({
        address: this.signer.toSuiAddress(),
        publicKey: this.signer.getPublicKey().toRawBytes(),
        chains: this.chains,
        features: [
          Feature.STANDARD__CONNECT,
          Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK,
          Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION,
          Feature.SUI__SIGN_TRANSACTION_BLOCK,
          Feature.SUI__SIGN_TRANSACTION,
          Feature.SUI__SIGN_MESSAGE,
          Feature.SUI__SIGN_PERSONAL_MESSAGE,
        ],
      }),
    ];
  }

  connect: StandardConnectMethod = async (
    input?: StandardConnectInput
  ): Promise<StandardConnectOutput> => {
    console.log("Sui Connect Function Called");
    if (this.accounts.length === 0) throw new Error("Empty Accounts");
    return { accounts: this.accounts };
  };

  disconnect: StandardDisconnectMethod = async (): Promise<void> => {
    console.log("Sui Disconnect Function Called");
    this.accounts = [];
    this.signer = undefined;
    this.sui = undefined;
  };

  on: StandardEventsOnMethod = (event, listener) => {
    return () => {};
  };

  signAndExecuteTransactionBlock: SuiSignAndExecuteTransactionBlockMethod =
    async (
      input: SuiSignAndExecuteTransactionBlockInput
    ): Promise<SuiSignAndExecuteTransactionBlockOutput> => {
      console.log("Sui signAndExecuteTransactionBlock Function Called");
      if (this.sui === undefined || this.signer === undefined) {
        throw new Error("Not connected");
      }
      input.transactionBlock.setSenderIfNotSet(this.signer.toSuiAddress());
      const txData = input.transactionBlock.serialize()
      await this.provider?.requestCredential('Transaction', txData);

      const txBytes = await input.transactionBlock.build({ client: this.sui });
      const { signature, bytes } = await this.signer.signTransaction(txBytes);
      const result = await this.sui.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: input.options,
      });
      this.provider?.transactionSubmitted(result.digest);
      return result;
    };

  signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod = async (
    input: SuiSignAndExecuteTransactionInput
  ): Promise<SuiSignAndExecuteTransactionOutput> => {
    console.log("Sui signAndExecuteTransaction Function Called");
    if (this.sui === undefined || this.signer === undefined) {
      throw new Error("Not connected");
    }
    const txString = await input.transaction.toJSON();
    const tx = Transaction.from(txString);

    await this.provider?.requestCredential('Transaction', JSON.stringify(txString,(key, value) => 
      typeof value === 'bigint' ? value.toString() : value));

    const txBytes = await tx.build({ client: this.sui });
    const { signature, bytes } = await this.signer.signTransaction(txBytes);
    const result = await this.sui.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: {
        showRawEffects: true,
      },
    });
    let effects: string = "";
    if (result.rawEffects) {
      const rawEffectsData = new Uint8Array(result.rawEffects);
      effects = toBase64(rawEffectsData);
    }
    this.provider?.transactionSubmitted(result.digest);
    return {
      digest: result.digest,
      /** Transaction effects as base64 encoded bcs. */
      effects,
      /** Transaction as base64 encoded bcs. */
      bytes,
      /** Base64 encoded signature */
      signature,
    };
  };

  signTransactionBlock: SuiSignTransactionBlockMethod = async (
    input: SuiSignTransactionBlockInput
  ): Promise<SuiSignTransactionBlockOutput> => {
    console.log("Sui signTransactionBlock Function Called");
    if (this.sui === undefined || this.signer === undefined) {
      throw new Error("Not connected");
    }

    await this.provider?.requestCredential('Transaction', JSON.stringify(input,(key, value) => 
      typeof value === 'bigint' ? value.toString() : value));

    const txBytes = await input.transactionBlock.build({ client: this.sui });
    const { signature, bytes } = await this.signer.signTransaction(txBytes);
    this.provider?.transactionSigned();
    return {
      /** Transaction as base64 encoded bcs. */
      transactionBlockBytes: bytes,
      /** Base64 encoded signature */
      signature,
    };
  };

  signTransaction: SuiSignTransactionMethod = async (
    input: SuiSignTransactionInput
  ): Promise<SignedTransaction> => {
    console.log("Sui signTransaction Function Called");
    if (this.sui === undefined || this.signer === undefined) {
      throw new Error("Not connected");
    }

    await this.provider?.requestCredential('Transaction', JSON.stringify(input,(key, value) => 
      typeof value === 'bigint' ? value.toString() : value));

    const txString = await input.transaction.toJSON();
    const tx = Transaction.from(txString);
    const txBytes = await tx.build({ client: this.sui });
    const { signature, bytes } = await this.signer.signTransaction(txBytes);
    this.provider?.transactionSigned();
    return {
      /** Transaction as base64 encoded bcs. */
      bytes,
      /** Base64 encoded signature */
      signature,
    };
  };

  signMessage: SuiSignMessageMethod = async (
    input: SuiSignMessageInput
  ): Promise<SuiSignMessageOutput> => {
    console.log("Sui signMessage Function Called");
    if (this.sui === undefined || this.signer === undefined) {
      throw new Error("Not connected");
    }

    await this.provider?.requestCredential('Signature', JSON.stringify(input,(key, value) => 
      typeof value === 'bigint' ? value.toString() : value));

    const result = await this.signer.signPersonalMessage(input.message);

    return {
      /** Base64 encoded message bytes */
      messageBytes: result.bytes,
      /** Base64 encoded signature */
      signature: result.signature,
    };
  };

  signPersonalMessage: SuiSignPersonalMessageMethod = async (
    input: SuiSignPersonalMessageInput
  ): Promise<SuiSignPersonalMessageOutput> => {
    console.log("Sui signPersonalMessage Function Called");
    if (this.sui === undefined || this.signer === undefined) {
      throw new Error("Not connected");
    }

    await this.provider?.requestCredential('Signature', JSON.stringify(input,(key, value) => 
      typeof value === 'bigint' ? value.toString() : value));

    const result = await this.signer.signPersonalMessage(input.message);

    return {
      /** Base64 encoded message bytes */
      bytes: result.bytes,
      /** Base64 encoded signature */
      signature: result.signature,
    };
  };
}
