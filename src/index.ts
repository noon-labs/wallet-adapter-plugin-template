import { registerWallet } from "@aptos-labs/wallet-standard";
import { MyWallet } from "./wallet";
export { MyWallet } from "./wallet";

(function () {
  console.log("register wallet");
  if (typeof window === "undefined") return;
  const myWallet = new MyWallet();
  registerWallet(myWallet);
})();
