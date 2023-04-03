import {BigNumber, ethers} from 'ethers'
import {useState} from 'react'
import {Address, useAccount, useEnsName, useNetwork, useWaitForTransaction, useSignTypedData, useSigner} from 'wagmi'

import {
    useDawantCoinName,
    useDawantCoinNonces, useDawantCoinPermit,
    useErc20Allowance,
    useErc20Approve,
    useErc20BalanceOf,
    useErc20Name,
    useErc20Symbol,
    useErc20TotalSupply,
    useErc20Transfer, usePrepareDawantCoinPermit,
    usePrepareErc20Approve,
    usePrepareErc20Transfer,
    usePrepareVaultDeposit,
    usePrepareVaultPermitDeposit, usePrepareVaultWithdraw,
    useVaultBalances,
    useVaultDeposit,
    useVaultPermitDeposit, useVaultWithdraw,
} from '../generated'

export function Vault() {
    const {address} = useAccount()


    const [erc20Address, setContractAddress] = useState<Address>(
        '0xc91aeFf8d82878645D704d7278EC17642e88E9B4',
    )

    const [vaultAddress, setVaultAddress] = useState<Address>('0x46A1240bAeF1969bFb8fCc0c3D7320Df9689cD18',)


    return (
        <div>
            <h2>Vault Contract</h2>
            Contract Address:{' '}
            <input
                onChange={(e) => setVaultAddress(e.target.value as Address)}
                style={{width: 400}}
                value={vaultAddress}
            />
            {vaultAddress && (
                <>
                    <h3>Info</h3>
                    <BalanceOf address={address as Address}/>
                    <h3>Deposit</h3>
                    <Deposit/>
                    <DepositPermit tokenAddress={erc20Address as Address} contractAddress={vaultAddress as Address}
                                   address={address as Address}/>
                    <Withdraw/>
                </>
            )}
        </div>
    )
}


function BalanceOf({address}: {
    address: Address
}) {
    const {data: balance} = useVaultBalances({
        args: [address],
        watch: true,
    })
    return <div>Balance: {balance?.toString()} units</div>
}


function Deposit() {
    const [amount, setAmount] = useState('0')

    const {config, error, isError} = usePrepareVaultDeposit({
        args: [BigNumber.from(amount)],
        enabled: Boolean(amount),
    })
    const {data, write} = useVaultDeposit(config)

    const {isLoading, isSuccess} = useWaitForTransaction({
        hash: data?.hash,
    })

    return (
        <div>
            Deposit:{' '}
            <input
                onChange={(e) => setAmount(e.target.value)}
                placeholder="amount (in wei)"
                value={amount}
            />
            <button disabled={!write} onClick={() => write?.()}>
                deposit
            </button>
            {isLoading && <ProcessingMessage hash={data?.hash}/>}
            {isSuccess && <div>Success!</div>}
            {isError && <div>Error: {error?.message}</div>}
        </div>
    )
}

function Withdraw(){
    const [amount, setAmount] = useState('0')

    const {config, error, isError} = usePrepareVaultWithdraw({
        args: [BigNumber.from(amount)],
        enabled: Boolean(amount),
    })
    const {data, write} = useVaultWithdraw(config)

    const {isLoading, isSuccess} = useWaitForTransaction({
        hash: data?.hash,
    })

    return (
        <div>
            Withdraw:{' '}
            <input
                onChange={(e) => setAmount(e.target.value)}
                placeholder="amount (in wei)"
                value={amount}
            />
            <button disabled={!write} onClick={() => write?.()}>
                withdraw
            </button>
            {isLoading && <ProcessingMessage hash={data?.hash}/>}
            {isSuccess && <div>Success!</div>}
            {isError && <div>Error: {error?.message}</div>}
        </div>
    )
}
function DepositPermit({tokenAddress, contractAddress, address,}: {
    tokenAddress: Address, contractAddress: Address, address: Address
}) {

    const [amount, setAmount] = useState('0')

    let {data: nonce} = useDawantCoinNonces({args: [address as Address]})
    const deadline = BigNumber.from(9999999999999);
    const {chain} = useNetwork();
    const chainId = chain?.id

    if (nonce === undefined) {
        nonce = BigNumber.from(0)
    }

    const {data: name} = useDawantCoinName()

    const domain = {
        name: name, version: '1', chainId: chainId, verifyingContract: tokenAddress
    };

    const types = {
        Permit: [
            {name: "owner", type: "address"},
            {name: "spender", type: "address"},
            {name: "value", type: "uint256"},
            {name: "nonce", type: "uint256"},
            {name: "deadline", type: "uint256"}
        ]
    };

    const message = {
        owner: address,
        spender: contractAddress,
        value: BigNumber.from(amount).toNumber(),
        nonce: BigNumber.from(nonce).toNumber(),
        deadline: BigNumber.from(deadline).toNumber(),
    };

    console.log(domain)
    console.log(types)
    console.log(message)


    const {data: signer} = useSigner()


    const {data: signature, error, isError, signTypedData} =
        useSignTypedData({
            domain: domain,
            types: types,
            value: message,
        })

    console.log(signature)


    return (
        <div>
            DepositPermit:{' '}
            <input
                onChange={(e) => setAmount(e.target.value)}
                placeholder="amount (in wei)"
                value={amount}
            />
            <button onClick={() => {
                signTypedData()
            }}>
                sign
            </button>
            {isError && <div>Error: {error?.message}</div>}
            {signature &&
                <SignPermit contractAddress={contractAddress} address={address} amount={BigNumber.from(amount)}
                            signature={signature} deadline={BigNumber.from(deadline)}/>}

        </div>
    )
}

function SignPermit({contractAddress, address, amount, deadline, signature,}: {
    contractAddress: Address, address: Address, amount: BigNumber, deadline: BigNumber, signature: String
}) {

    let {v, r, s} = ethers.utils.splitSignature(signature);

    console.log("v:" + v)
    console.log("r:" + r)
    console.log("s:" + s)
    console.log("deadline:" + deadline)


    let {config, error, isError} = usePrepareVaultPermitDeposit({
        args: [BigNumber.from(amount), BigNumber.from(deadline), v, r as Address, s as Address],
    })

    console.log(config)
    let {data, write} = useVaultPermitDeposit(config)
    console.log(write)

    let {isLoading, isSuccess} = useWaitForTransaction({
        hash: data?.hash,
    })


    return <div>
        <div>Sign:{signature}</div>
        <button onClick={() => {
            write?.();
        }}>
            Deposit
        </button>

        {signature && isLoading && <ProcessingMessage hash={data?.hash}/>}
        {signature && isSuccess && <div>Success!</div>}
        {signature && isError && <div>Error: {error?.message}</div>}
    </div>
}

function ProcessingMessage({hash}: { hash?: `0x${string}` }) {
    const {chain} = useNetwork()
    const etherscan = chain?.blockExplorers?.etherscan
    return (
        <span>
      Processing transaction...{' '}
            {etherscan && (
                <a href={`${etherscan.url}/tx/${hash}`}>{etherscan.name}</a>
            )}
    </span>
    )
}
