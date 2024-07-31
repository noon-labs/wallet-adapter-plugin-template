import {
  Account,
  AccountAuthenticator,
  AnyRawTransaction,
  Aptos,
  AptosConfig,
  Network,
  SigningScheme,
} from "@aptos-labs/ts-sdk";
import {
  APTOS_CHAINS,
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
  AptosChangeNetworkMethod,
  AptosChangeNetworkOutput,
  AptosSignAndSubmitTransactionMethod,
  AptosSignAndSubmitTransactionInput,
  AptosSignAndSubmitTransactionOutput,
} from "@aptos-labs/wallet-standard";

// REVISION - Rename AptosWindow to <Your Wallet Name>Window. Ex. "PetraWindow"
// Ensure that you update all references to AptosWindow with the new name.
interface LunchWindow extends Window {
  // REVISION - Rename "aptos" to your wallet name in all lowercase. Ex. "petra"
  // This must match your wallet's name property.
  // Ensure that you update all references to `AptosWindow.aptos` with the new name.
  aptosWebView?: AptosWebView;
}
/**
 * A window containing a DOM document; the document property points to the DOM document loaded in that window.
 * We have extended it to include the plugin provider you implement with the required features.
 */
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
/**
 * This class is a template you can modify to implement an AIP-62 Wallet.
 *
 * Sections of the code which need to be revised will be marked with a "REVISION" comment.
 * We recommend using the REVISION comments like a checklist and deleting them as you go.
 * Ex. REVISION - Update this section.
 *
 * Function implementations are for DEMONSTRATION PURPOSES ONLY. Please ensure you rewrite all features
 * to use your Wallet as the method of communicating on-chain.
 *
 * For a working implementation of this example, see the next-js example app here: https://github.com/aptos-labs/aptos-wallet-adapter/tree/main/apps/nextjs-example
 * (And more specifically, see https://github.com/aptos-labs/aptos-wallet-adapter/blob/main/apps/nextjs-example/src/utils/standardWallet.ts)
 */

/**
 * Interface of a **WalletAccount**, also referred to as an **Account**.
 *
 * An account is a _read-only data object_ that is provided from the Wallet to the app, authorizing the app to use it.
 *
 * The app can use an account to display and query information from a chain.
 *
 * The app can also act using an account by passing it to functions of the Wallet.
 *
 * Wallets may use or extend {@link "@wallet-standard/wallet".ReadonlyWalletAccount} which implements this interface.
 *
 */
// REVISION - Replace the "MyWallet" in "MyWalletAccount" with the name of your wallet. Ex. "PetraAccount"
export class LunchWalletAccount implements AptosWalletAccount {
  /** Address of the account, corresponding with a public key. */
  address: string;

  /** Public key of the account, corresponding with a secret key to use. */
  publicKey: Uint8Array;

  /**
   * Chains supported by the account.
   *
   * This must be a subset of ["aptos:devnet", "aptos:testnet", "aptos:localnet", "aptos:mainnet"].
   *
   * It is recommended to support at least ["aptos:devnet", "aptos:testnet", and "aptos:mainnet"].
   */
  chains: IdentifierArray = APTOS_CHAINS;
  /**
   * Function names of features that are supported for this Wallet's account object.
   */
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

  /** The signing scheme used for the private key of the address. Ex. SigningScheme.Ed25519 */
  signingScheme: SigningScheme = SigningScheme.Ed25519;

  /** Optional user-friendly descriptive label or name for the account. This may be displayed by the app. */
  label?: string;

  /**
   * Optional user-friendly icon for the account. This may be displayed by the app.
   */
  icon?:
    | `data:image/svg+xml;base64,${string}`
    | `data:image/webp;base64,${string}`
    | `data:image/png;base64,${string}`
    | `data:image/gif;base64,${string}`
    | undefined;

  // REVISION - Update this constructor to use values your wallet supports.
  constructor(account: Account) {
    this.address = account.accountAddress.toString();
    this.publicKey = account.publicKey.toUint8Array();
    // REVISION - Choose which chains your wallet supports. This may only be subset of all Aptos networks.
    this.chains = APTOS_CHAINS; // ["aptos:devnet", "aptos:testnet", "aptos:localnet", "aptos:mainnet"]
    /**
     * REVISION - Ensure this signing scheme matches the encoding used to generate your private key.
     */
    this.signingScheme = account.signingScheme;
  }
}

/**
 * REVISION - This class needs to be extensively customized to match the details of your wallet.
 *
 * 1. MyWallet should be renamed to be the name of your wallet. Ex. For Petra, MyWallet should be named "PetraWallet". (Be sure to also update references to "MyWallet" in this file.)
 * 2. Update the values of this class to match your Wallet's deatils.
 * 3. Implement each of the features below. (Including adding implementations for any additional required features that you can find here in the "AptosFeatures" type: https://github.com/aptos-labs/wallet-standard/blob/main/src/features/index.ts)
 */
export class LunchWallet implements AptosWallet {
  provider: AptosWebView | undefined;

  // REVISION - Include the link to create an account using your wallet or your primary website. (Ex. https://chromewebstore.google.com/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci?hl=en)
  readonly url: string = "https://lunchlunch.xyz";
  // This should be updated whenever you release a new implementation of "MyWallet"
  readonly version = "1.0.0";
  // REVISION - Change the name to the name of your Wallet. (Ex. "Petra")
  readonly name: string = "LunchLunch";
  /**
   * REVISION - Set the icon to be a base64 encoding of your Wallet's logo.
   *
   * The icon data must be of the format:
   * 1. "data:image/"
   * 2. The icon's file extension, which must be one of:
   *    - "svg+xml"
   *    - "webp"
   *    - "png"
   *    - "gif"
   * 3. ";base64,"
   * 4. The base64 encoding of the image file.
   *
   * See the current value of icon for an example of this format.
   */
  readonly icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyODdfMTM0MzEpIj4KPHBhdGggZD0iTTMyLjAwMDIgMEgwLjAwMDI0NDE0MVYzMkgzMi4wMDAyVjBaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTI4N18xMzQzMSkiLz4KPHBhdGggZD0iTTE4LjEzMzcgMjguMDY1NEMxMi43MTIyIDI4LjA2NTQgOC45Mjg2OCAyNC41MDI0IDguOTI4NjggMTkuMzk5NEM4LjkyODY4IDEzLjM3MjQgMTIuMzcyNyA3LjEzNTQxIDE4LjEzMzcgNy4xMzU0MUMyMy44OTQ3IDcuMTM1NDEgMjcuMzM4NyAxMy4zNzI0IDI3LjMzODcgMTkuMzk5NEMyNy4zMzg3IDI0LjUwMjQgMjMuNTU1MiAyOC4wNjU0IDE4LjEzMzcgMjguMDY1NFoiIGZpbGw9ImJsYWNrIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMV8xMjg3XzEzNDMxKSI+CjxwYXRoIGQ9Ik0xNi4wMDAzIDI1LjkzMkMxMC41Nzg4IDI1LjkzMiA2Ljc5NTMyIDIyLjM2OSA2Ljc5NTMyIDE3LjI2NkM2Ljc5NTMyIDExLjIzOSAxMC4yMzkzIDUuMDAyMDEgMTYuMDAwMyA1LjAwMjAxQzIxLjc2MTMgNS4wMDIwMSAyNS4yMDUzIDExLjIzOSAyNS4yMDUzIDE3LjI2NkMyNS4yMDUzIDIyLjM2OSAyMS40MjE4IDI1LjkzMiAxNi4wMDAzIDI1LjkzMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMC44MzQ0IDEwLjA2OTVDMTkuOTEwNCA4Ljc0OTk5IDE4LjM1MjkgNy4yNzY0OSAxNi4wMDA5IDcuMjc2NDlWMTUuNDY2NUwyMC44MzQ0IDEwLjA2OTVaIiBmaWxsPSIjRkY5NjNCIi8+CjxwYXRoIGQ9Ik0xNi4wMDA3IDcuMjc2NDlDMTMuNjQ4NyA3LjI3NjQ5IDEyLjA5MTIgOC43NDk5OSAxMS4xNjcyIDEwLjA2OTVMMTYuMDAwNyAxNS40NjY1VjcuMjc2NDlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTEuMTY3IDEwLjA3MDZDMTEuMTIxNSAxMC4xMzcxIDExLjA3NiAxMC4yMDAxIDExLjAzNCAxMC4yNjMxQzEwLjMyNyAxMS4zMzA2IDkuNzk4NDUgMTIuNjE4NiA5LjQ2NTk1IDEzLjk5NzZMMTYuMDA0IDE1LjQ2NDFMMTEuMTcwNSAxMC4wNjcxTDExLjE2NyAxMC4wNzA2WiIgZmlsbD0iI0ZGREUwMCIvPgo8cGF0aCBkPSJNOS40NjI4NyAxNC4wMDA1QzkuMjEwODcgMTUuMDUwNSA5LjA3MDg3IDE2LjE1NjUgOS4wNzA4NyAxNy4yNjZDOS4wNzA4NyAxNy43ODc1IDkuMTI2ODcgMTguMjg0NSA5LjIyODM3IDE4Ljc1N0wxNi4wMDA5IDE1LjQ2N0w5LjQ2Mjg3IDE0LjAwMDVaIiBmaWxsPSIjRkFCQzAwIi8+CjxwYXRoIGQ9Ik0xMS41MzQ5IDIyLjMzOUMxMi43MDA0IDIzLjE3OSAxNC4yMjI5IDIzLjY1NSAxNi4wMDA5IDIzLjY1NVYxNS40NjVMMTEuNTM0OSAyMi4zMzlaIiBmaWxsPSIjRkY5NjNCIi8+CjxwYXRoIGQ9Ik0xNi4wMDA4IDIzLjY1NUMxNy43Nzg4IDIzLjY1NSAxOS4zMDEzIDIzLjE3OSAyMC40NjY4IDIyLjMzOUwxNi4wMDA4IDE1LjQ2NVYyMy42NTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAuNDY2OCAyMi4zMzlDMjEuNjQ2MyAyMS40ODUgMjIuNDU0OCAyMC4yNTY1IDIyLjc3MzMgMTguNzU1TDE2LjAwMDggMTUuNDY1TDIwLjQ2NjggMjIuMzM5WiIgZmlsbD0iI0ZBQkMwMCIvPgo8cGF0aCBkPSJNMjIuNzczMyAxOC43NTdDMjIuODc0OCAxOC4yODQ1IDIyLjkzMDggMTcuNzg3NSAyMi45MzA4IDE3LjI2NkMyMi45MzA4IDE2LjE1NjUgMjIuNzkwOCAxNS4wNTA1IDIyLjUzODggMTQuMDAwNUwxNi4wMDA4IDE1LjQ2N0wyMi43NzMzIDE4Ljc1N1oiIGZpbGw9IiNGQUJDMDAiLz4KPHBhdGggZD0iTTIwLjgzNDMgMTAuMDcxM0wxNi4wMDA4IDE1LjQ2ODNMMjIuNTM4OCAxNC4wMDE4QzIyLjIwNjMgMTIuNjIyOCAyMS42Nzc4IDExLjMzNDggMjAuOTcwOCAxMC4yNjczQzIwLjkyODggMTAuMjA0MyAyMC44ODMzIDEwLjEzNzggMjAuODM3OCAxMC4wNzQ4TDIwLjgzNDMgMTAuMDcxM1oiIGZpbGw9IiNGRjc5MDAiLz4KPHBhdGggZD0iTTkuMjI5NDcgMTguNzU1QzkuNTQ3OTcgMjAuMjU2NSAxMC4zNTY1IDIxLjQ4ODUgMTEuNTM2IDIyLjMzOUwxNi4wMDIgMTUuNDY1TDkuMjI5NDcgMTguNzU1WiIgZmlsbD0iI0ZGNzkwMCIvPgo8cGF0aCBkPSJNMTUuOTk5MiAyMS4wNjc2QzEzLjMyMTcgMjEuMDY3NiAxMS42NTkyIDE5LjYxMTYgMTEuNjU5MiAxNy4yNjY2QzExLjY1OTIgMTMuNzA3MSAxMy4zMTgyIDkuODY3NjUgMTUuOTk5MiA5Ljg2NzY1QzE4LjY4MDIgOS44Njc2NSAyMC4zMzkyIDEzLjcwNzEgMjAuMzM5MiAxNy4yNjY2QzIwLjMzOTIgMTkuNjExNiAxOC42NzY3IDIxLjA2NzYgMTUuOTk5MiAyMS4wNjc2WiIgZmlsbD0iI0ZGREUwMCIvPgo8L2c+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMjg3XzEzNDMxIiB4MT0iMTYuMDAwMiIgeTE9IjAiIHgyPSIxNi4wMDAyIiB5Mj0iMzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwNTJDRCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDBBNjgiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMjg3XzEzNDMxIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8Y2xpcFBhdGggaWQ9ImNsaXAxXzEyODdfMTM0MzEiPgo8cmVjdCB3aWR0aD0iMjIuNCIgaGVpZ2h0PSIyMi40IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNC43OTk5OSA0LjI2NjY2KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";

  /**
   * REVISION - Set the subset of Aptos chains your wallet supports.
   * APTOS_CHAINS = ["aptos:devnet", "aptos:testnet", "aptos:localnet", "aptos:mainnet"]
   * It is recommended to support at least "aptos:mainnet", "aptos:testnet", and "aptos:devnet".
   */
  chains = APTOS_CHAINS;
  /**
   * The set of accounts that your Wallet has shared information for. These do NOT include private keys.
   * This list is normally expanded during `aptos:connect` and reduced during `aptos:disconnect`.
   * NOTE: For demonstration purposes, the template initializes a default account in the constructor,
   * but that should NOT be carried into your final implementation of this template.
   */
  accounts: LunchWalletAccount[] = [];

  // Local MyWallet class variables,
  /**
   * REVISION - These two variables likely should NOT be in your finalized plugin template.
   * They are used throughout this example's feature implementations in order to show how you could
   * implement each function.
   *
   * signer - This stores the private keys for an account on-chain. (Example purposes only)
   * aptos - This handles the network connection. (Your wallet may have a different way of handling the on-chain connection than this Aptos instance)
   *
   * Remember: These two variables SHOULD LIKELY BE DELETED after you replace your implementations of each feature with ones that use your Wallet.
   */
  signer: Account | undefined;
  aptos: Aptos | undefined;

  /**
   * REVISION - List all features your wallet supports below.
   * You will need to implement how your wallet supports each.
   *
   * In order to be compatible with the AIP-62 Wallet standard, ensure you are at least supporting all
   * currently required features by checking the list of features in the `AptosFeatures` type here:
   * https://github.com/aptos-labs/wallet-standard/blob/main/src/features/index.ts
   *
   * To find the names of features to pass into `this.features` below you can either go into the feature implementations
   * and look at the <AptosFeature>NameSpace variable, or you can import the `AptosFeatures` type and see the names there.
   * Ex. See `AptosSignTransactionNamespace` in https://github.com/aptos-labs/wallet-standard/blob/main/src/features/aptosSignTransaction.ts
   *
   * For additional customization, you may implement optional features.
   * For the most support though, you should extend the wallet-standard to support additional features as part of the standard.
   */
  get features(): AptosFeatures {
    return {
      "aptos:connect": {
        version: "1.0.0",
        connect: this.connect,
      },
      "aptos:network": {
        version: "1.0.0",
        network: this.network,
      },
      "aptos:changeNetwork": {
        version: "1.0.0",
        changeNetwork: this.changeNetwork,
      },
      "aptos:disconnect": {
        version: "1.0.0",
        disconnect: this.disconnect,
      },
      "aptos:signAndSubmitTransaction": {
        version: "1.1.0",
        signAndSubmitTransaction: this.signAndSubmitTransaction,
      },
      "aptos:signTransaction": {
        version: "1.0.0",
        signTransaction: this.signTransaction,
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

  /**
   * REVISION - This constructor should be updated to support your Wallet's implementation of the supported features.
   *
   * The template code's constructor currently initializes `signer` to act as the private key for an account on-chain, and uses
   * `aptos` to handle the on-chain connection.
   *
   */
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
    this.accounts = [new LunchWalletAccount(this.signer)];
  }
  /**
   * REVISION - Implement this function using your Wallet.
   *
   * Look up the account info for the currently connected wallet address on the chosen network.
   *
   * @returns Return account info.
   */
  account: AptosGetAccountMethod = async (): Promise<AccountInfo> => {
    console.log("account function called");
    if (this.signer === undefined) throw new Error("Empty Signer.");
    const account = new AccountInfo({
      address: this.signer.accountAddress,
      publicKey: this.signer.publicKey,
    });
    return account;
  };

  /**
   * REVISION - Implement this function using your Wallet.
   *
   * Connect an account using this Wallet.
   * This must wait for the user to sign in to the Wallet provider and confirm they are ok sharing
   * details with the dapp.
   *
   * For demonstration purposes, this template example assumes the user is using the account generated in `signer`
   * and assumes the user approved letting the dapp use the account information.
   *
   * Your implmentation should include a way to track which account was just connected. This likely will involve
   * setting the `this.accounts` variable.
   *
   * @returns Whether the user approved connecting their account, and account info.
   * @throws Error when unable to connect to the Wallet provider.
   */
  connect: AptosConnectMethod = async (): Promise<
    UserResponse<AccountInfo>
  > => {
    console.log("connect function called");
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

  /**
   * REVISION - Implement this function using your Wallet.
   *
   * Return the name, chainId, and url of the network connection your wallet is using to connect to the Aptos chain.
   *
   * @returns Which network the connected Wallet is pointing to.
   */
  network: AptosGetNetworkMethod = async (): Promise<NetworkInfo> => {
    console.log("network function called");
    if (this.aptos === undefined) throw new Error("Empty Aptos.");
    // You may use getLedgerInfo() to determine which ledger your Wallet is connected to.
    const network = await this.aptos.getLedgerInfo();

    return {
      // REVISION - Ensure the name and url match the chain_id your wallet responds with.
      name: this.aptos.config.network,
      // REVISION - For mainnet and testnet is not recommended to make the getLedgerInfo() network call as the chain_id is fixed for those networks.
      chainId: network.chain_id,
    };
  };

  /**
   * REVISION - Implement this function using your Wallet.
   *
   * Remove the permission of the Wallet class to access the account that was connected.
   *
   * @returns Resolves when done cleaning up.
   */
  disconnect: AptosDisconnectMethod = async (): Promise<void> => {
    console.log("changeNetwork function called");
    this.accounts = [];
    return Promise.resolve();
  };

  changeNetwork: AptosChangeNetworkMethod = async (): Promise<
    UserResponse<AptosChangeNetworkOutput>
  > => {
    console.log("changeNetwork function called");
    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        success: true,
      },
    });
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
      const tx = await this.aptos.transaction.build.simple({
        sender: this.signer.accountAddress,
        data: transaction.payload,
        options: {
          gasUnitPrice: transaction.gasUnitPrice,
          maxGasAmount: transaction.maxGasAmount,
        },
      });
      const committedTransaction = await this.aptos.signAndSubmitTransaction({
        signer: this.signer,
        transaction: tx,
      });
      this.provider?.aptosTransactionSubmitted(committedTransaction.hash);
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
  /**
   * REVISION - Implement this function using your Wallet.
   *
   * @param transaction - A transaction that the user should have the ability to sign if they choose to.
   * @param asFeePayer - Optionally, another this signature is acting as a fee-payer for the transaction being signed.
   * @returns The result of whether the user chose to sign the transaction or not.
   */
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

  /**
   * REVISION - Implement this function using your Wallet.
   *
   * @param input - A message to sign with the private key of the connected account.
   * @returns A user response either with a signed message, or the user rejecting to sign.
   */
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

  /**
   * REVISION - Implement this function using your Wallet.
   *
   * An event which will be triggered anytime an Account changes.
   *
   * @returns when the logic is resolved.
   */
  onAccountChange: AptosOnAccountChangeMethod = async (): Promise<void> => {
    console.log("onAccountChang function called");
    return Promise.resolve();
  };

  /**
   * REVISION - Implement this function using your Wallet.
   *
   * When users indicate a Network change should occur, update your Wallet accordingly.
   *
   * @returns when the logic is resolved.
   */
  onNetworkChange: AptosOnNetworkChangeMethod = async (): Promise<void> => {
    console.log("onNetworkChange function called");
    return Promise.resolve();
  };
}
