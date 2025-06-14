import { defineChain } from 'viem'

export const monadTestnet = defineChain({
    id: 10143,
    name: "Monad Testnet",
    network: "Monad Testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Monad",
      symbol: "MON",
    },
    rpcUrls: {
      default: {
        http: ["https://testnet-rpc.monad.xyz"],
      },
      public: {
        http: ["https://testnet-rpc.monad.xyz"],
      },
    },
    blockExplorers: {
      default: { name: "Block Explorer Url", url: "https://testnet.monadexplorer.com" },
    },
    testnet: true,
  });