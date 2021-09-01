require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const abbrv = (str) => `${str.substr(0, 4)}...`;

if (!process.env.PRIVATE_KEY) {
    throw new Error("define PRIVATE_KEY in .env first!");
} else {
    console.log("Using env var PRIVATE_KEY", abbrv(process.env.PRIVATE_KEY));
}
if (process.env.INFURA_APIKEY) {
    console.log("Using env var INFURA_APIKEY", abbrv(process.env.INFURA_APIKEY));
}
// if (process.env.PRIVATE_NETWORK_URL) {
//     console.log("Using env var PRIVATE_NETWORK", process.env.PRIVATE_NETWORK_URL);
// }
// if (process.env.PRIVATE_NETWORK_ID) {
//     console.log("Using env var PRIVATE_NETWORK_ID", process.env.PRIVATE_NETWORK_ID);
// }
if (process.env.ETHERSCAN_APIKEY) {
    console.log("Using env var process.env.ETHERSCAN_APIKEY", abbrv(process.env.ETHERSCAN_APIKEY));
}

module.exports = {
    plugins: [
        'truffle-plugin-verify',
        'truffle-contract-size'
    ],
    etherscan: {
        apiKey: process.env.ETHERSCAN_APIKEY
    },
    networks: {
        development: {
            host: 'localhost', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*', // Any network (default: none)
            gas: 10000000,
        },
        coverage: {
            host: 'localhost',
            network_id: '*',
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01,
        },
        // Useful for deploying to a public network.
        ropsten: {
            provider: () => new HDWalletProvider({
                privateKeys: [process.env.PRIVATE_KEY],
                providerOrUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_APIKEY}`
            }),
            network_id: 3,          // Ropsten's id
            // gas: 5500000,        // Ropsten has a lower block limit than mainnet
            // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
            // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
            // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
        },
    },
    // Configure your compilers
    compilers: {
        solc: {
            version: '0.6.12',
            settings: { // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
                evmVersion: 'istanbul',
            },
        },
    }
};
