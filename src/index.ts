import { registerWallet } from "@aptos-labs/wallet-standard";
import { AptosStandard } from "./wallet/wallet";

void (() => {
  console.log("register wallet");
  if (typeof window === "undefined") return;
  const aptos = new AptosStandard();
  aptos.initialize();
  registerWallet(aptos);
})();
