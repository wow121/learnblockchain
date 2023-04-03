import {useAccount} from 'wagmi'

import {Account, Connect, ERC20, NetworkSwitcher} from './components'
import {Vault} from "./components/Vault";

export function App() {
    const {isConnected} = useAccount()

    return (
        <>
            <h1>wagmi</h1>

            <Connect/>

            {isConnected && (
                <>
                    <Account/>
                    <Vault/>
                    <ERC20/>
                    <NetworkSwitcher/>
                </>
            )}
        </>
    )
}
