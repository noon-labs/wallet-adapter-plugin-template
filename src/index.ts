import { registerWallet as aptosRegisterWallet } from "@aptos-labs/wallet-standard";
import { registerWallet as suiRegisterWallet } from "@mysten/wallet-standard";
import { AptosStandard, SuiStandard } from "./wallet";

void (() => {
  console.log("register wallet");
  if (typeof window === "undefined") return;
  const aptos = new AptosStandard();
  aptos.initialize();
  aptosRegisterWallet(aptos);
  const sui = new SuiStandard();
  sui.initialize();
  suiRegisterWallet(sui);
})();
