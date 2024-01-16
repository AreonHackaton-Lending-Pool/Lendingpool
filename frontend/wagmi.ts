// import { w3mConnectors, w3mProvider } from "@web3modal/ethereum";
// import { configureChains, createConfig } from "wagmi";
// import { goerli, mainnet, sepolia } from "wagmi/chains";

// const { chains, publicClient, webSocketPublicClient } = configureChains(
//   [sepolia],
//   [w3mProvider({ projectId: "94ea82a1eb0ec7c5e33bbe6b5ba63f76" })]
// );

// export const config = createConfig({
//   autoConnect: true,
//   connectors: w3mConnectors({
//     chains,
//     projectId: "94ea82a1eb0ec7c5e33bbe6b5ba63f76",
//     version: 2,
//   }),
//   publicClient,
//   webSocketPublicClient,
// });

// export { chains };

import { http, createConfig } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  // ssr: true,
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
