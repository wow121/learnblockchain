import {configureChains, createClient} from 'wagmi'
import {goerli, mainnet, polygonMumbai,sepolia} from 'wagmi/chains'
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet'
import {InjectedConnector} from 'wagmi/connectors/injected'
import {MetaMaskConnector} from 'wagmi/connectors/metaMask'
import {WalletConnectLegacyConnector} from 'wagmi/connectors/walletConnectLegacy'
import {publicProvider} from 'wagmi/providers/public'

const {chains, provider, webSocketProvider} = configureChains(
    [polygonMumbai,sepolia],
    [
        publicProvider(),
    ],
)

export const client = createClient({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({chains}),
    ],
    provider,
    webSocketProvider,
})
