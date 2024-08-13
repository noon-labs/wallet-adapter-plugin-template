import { IdentifierArray, ReadonlyWalletAccount, StandardConnectFeature, StandardConnectMethod, StandardDisconnectFeature, StandardDisconnectMethod, StandardEventsFeature, StandardEventsOnMethod, SuiSignAndExecuteTransactionBlockFeature, SuiSignAndExecuteTransactionBlockMethod, SuiSignAndExecuteTransactionFeature, SuiSignAndExecuteTransactionMethod, SuiSignMessageFeature, SuiSignMessageMethod, SuiSignPersonalMessageFeature, SuiSignPersonalMessageMethod, SuiSignTransactionBlockFeature, SuiSignTransactionBlockMethod, SuiSignTransactionFeature, SuiSignTransactionMethod, Wallet } from "@mysten/wallet-standard";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
interface SuiWebView {
    getSuiMnemonics: () => Promise<string>;
    getSuiNodeUrl: () => Promise<string>;
    suiTransactionSubmitted: (hash: string) => void;
    suiTransactionSigned: () => void;
    handleResponse: (id: number, result: string) => void;
    handleError: (id: number, error: any) => void;
    callbacks: {
        [key: number]: (error: any, data: any) => void;
    };
}
type Features = StandardConnectFeature & StandardDisconnectFeature & StandardEventsFeature & SuiSignAndExecuteTransactionBlockFeature & SuiSignAndExecuteTransactionFeature & SuiSignTransactionBlockFeature & SuiSignTransactionFeature & SuiSignMessageFeature & SuiSignPersonalMessageFeature;
export declare class SuiStandard implements Wallet {
    provider: SuiWebView | undefined;
    get version(): "1.0.0";
    get name(): "Lunch Wallet";
    get icon(): any;
    get chains(): IdentifierArray;
    accounts: ReadonlyWalletAccount[];
    signer: Ed25519Keypair | undefined;
    sui: SuiClient | undefined;
    get features(): Features;
    constructor();
    initialize(): Promise<void>;
    connect: StandardConnectMethod;
    disconnect: StandardDisconnectMethod;
    on: StandardEventsOnMethod;
    signAndExecuteTransactionBlock: SuiSignAndExecuteTransactionBlockMethod;
    signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod;
    signTransactionBlock: SuiSignTransactionBlockMethod;
    signTransaction: SuiSignTransactionMethod;
    signMessage: SuiSignMessageMethod;
    signPersonalMessage: SuiSignPersonalMessageMethod;
}
export {};
//# sourceMappingURL=suiWallet.d.ts.map