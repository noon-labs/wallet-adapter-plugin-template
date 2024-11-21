import { registerWallet as aptosRegisterWallet } from "@aptos-labs/wallet-standard";
import { registerWallet as suiRegisterWallet } from "@mysten/wallet-standard";
import { AptosStandard, SuiStandard } from "./wallet";

void (() => {
  console.log("register wallet");
  if (typeof window === "undefined") return;
  const aptos = new AptosStandard();
  aptos.initialize();
  aptosRegisterWallet(aptos);

  //이름 바꾸기로 안되는 경우가 있어서 Lunch Wallet 추가로 register
  const lunchAptos = new AptosStandard("Lunch Wallet");
  lunchAptos.initialize()
  aptosRegisterWallet(lunchAptos);

  const sui = new SuiStandard();
  sui.initialize();
  suiRegisterWallet(sui);
})();
