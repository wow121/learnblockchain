export const vaultAbi = [{
    "inputs": [{"internalType": "address", "name": "addr", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balances",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
    }, {"internalType": "uint8", "name": "v", "type": "uint8"}, {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
    }, {"internalType": "bytes32", "name": "s", "type": "bytes32"}],
    "name": "permitDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [],
    "name": "tokenAddress",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const