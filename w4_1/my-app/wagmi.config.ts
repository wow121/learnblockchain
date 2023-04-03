import {defineConfig} from '@wagmi/cli'
import {erc, react} from '@wagmi/cli/plugins'
import * as chains from '@wagmi/chains'

import {vaultAbi} from "./src/abis/Vault";
import {erc20Permit} from "./src/abis/Erc20Permit";

export default defineConfig({
    out: 'src/generated.ts',
    plugins: [erc(), react()],
    contracts: [
        {
            abi: vaultAbi,
            name: 'Vault',
            address: {
                [chains.polygonMumbai.id]: '0x46A1240bAeF1969bFb8fCc0c3D7320Df9689cD18'
            }
        }, {
            abi: erc20Permit,
            name: 'Dawant Coin',
            address: {
                [chains.polygonMumbai.id]: '0xc91aeFf8d82878645D704d7278EC17642e88E9B4'
            }
        }
    ]
})
