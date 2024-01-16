// import { http, createConfig } from "wagmi";
// import { sepolia, mainnet } from "wagmi/chains";
// import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

// export const config = createConfig({
//   chains: [sepolia, mainnet],
//   connectors: [injected()],
//   // ssr: true,
//   transports: {
//     [sepolia.id]: http(),
//     [mainnet.id]: http(),
//   },
// });

// declare module "wagmi" {
//   interface Register {
//     config: typeof config;
//   }
// }
