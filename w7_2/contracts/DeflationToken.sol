// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DeflationToken is Ownable {
    uint lastRebaseTime;

    uint256 private constant DECIMALS = 18;

    uint256 private constant MAX_UINT256 = type(uint256).max;

    uint256 private constant TOTAL_GONS = MAX_UINT256 - (MAX_UINT256 % INITIAL_FRAGMENTS_SUPPLY);

    uint256 private constant INITIAL_FRAGMENTS_SUPPLY = 50 * 10 ** 6 * 10 ** DECIMALS;


    string private _name;
    string private _symbol;
    uint8 private _decimals = uint8(DECIMALS);

    uint256 private _totalSupply;
    uint256 private _gonsPerFragment;

    mapping(address => uint256) private _gonBalances;

    mapping(address => mapping(address => uint256)) private _allowedFragments;



    constructor() {
        lastRebaseTime = block.timestamp;

        _name = "Dawant Coin E";
        _symbol = "DTCE";

        _totalSupply = INITIAL_FRAGMENTS_SUPPLY;
        _gonBalances[msg.sender] = TOTAL_GONS;
        _gonsPerFragment = TOTAL_GONS / _totalSupply;

    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }


    function rebase() public onlyOwner returns (uint){
        require(block.timestamp - lastRebaseTime > 31536000, "can't rebase");

        _totalSupply = _totalSupply - _totalSupply / 100;

        _gonsPerFragment = TOTAL_GONS / _totalSupply;

        lastRebaseTime = block.timestamp;

        return _totalSupply;
    }

    function totalSupply() external view returns (uint256){
        return _totalSupply;
    }

    function balanceOf(address who) external view returns (uint256) {
        return _gonBalances[who] / _gonsPerFragment;
    }

    function scaledBalanceOf(address who) external view returns (uint256) {
        return _gonBalances[who];
    }

    function scaledTotalSupply() external pure returns (uint256) {
        return TOTAL_GONS;
    }

    function transfer(address to, uint256 value) external returns (bool)
    {
        uint256 gonValue = value * _gonsPerFragment;

        _gonBalances[msg.sender] = _gonBalances[msg.sender] - gonValue;
        _gonBalances[to] = _gonBalances[to] + gonValue;

        return true;
    }

    function transferAll(address to) external returns (bool) {
        uint256 gonValue = _gonBalances[msg.sender];
        uint256 value = gonValue * _gonsPerFragment;

        delete _gonBalances[msg.sender];
        _gonBalances[to] = _gonBalances[to] + gonValue;

        return true;
    }

    function allowance(address owner_, address spender) external view returns (uint256) {
        return _allowedFragments[owner_][spender];
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        _allowedFragments[from][msg.sender] = _allowedFragments[from][msg.sender] - value;

        uint256 gonValue = value * _gonsPerFragment;
        _gonBalances[from] = _gonBalances[from] - gonValue;
        _gonBalances[to] = _gonBalances[to] + gonValue;

        return true;
    }

    function transferAllFrom(address from, address to) external returns (bool) {
        uint256 gonValue = _gonBalances[from];
        uint256 value = gonValue / _gonsPerFragment;

        _allowedFragments[from][msg.sender] = _allowedFragments[from][msg.sender] - value;

        delete _gonBalances[from];
        _gonBalances[to] = _gonBalances[to] + gonValue;

        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        _allowedFragments[msg.sender][spender] = value;
        return true;
    }


}
