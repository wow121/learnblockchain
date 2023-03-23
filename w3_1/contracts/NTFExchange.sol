// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NTFExchange is IERC721Receiver {

    address public tokenAddr;

    address public NTFAddr;

    mapping(uint256 => NTFSell) public sellMap;


    struct NTFSell {
        bool active; //是否激活的挂单
        uint price; //价格
        address seller; //出售人
    }

    event NewSellEvent(uint tokenId, uint price);
    event NTFSoldEvent(uint tokenId, uint price, address buyer);

    constructor(address _tokenAddr, address _NTFAddr)  {
        tokenAddr = _tokenAddr;
        NTFAddr = _NTFAddr;
    }


    function sellNTF(uint _tokenId, uint _price) public {
        IERC721 ntf = IERC721(NTFAddr);
        require(ntf.ownerOf(_tokenId) == msg.sender, "You're not the owner");
        require(_price > 0, "price must more than 0");

        //创建挂单
        sellMap[_tokenId] = NTFSell({active : true, seller : msg.sender, price : _price});

        ntf.safeTransferFrom(msg.sender, address(this), _tokenId);


        emit NewSellEvent(_tokenId, _price);
    }

    function buyNTF(uint _tokenId, uint price) public {
        IERC721 ntf = IERC721(NTFAddr);
        NTFSell storage ntfSell = sellMap[_tokenId];
        require(ntfSell.active, "ntf not active");
        require(ntfSell.price == price, "price must equals sell price");


        SafeERC20.safeTransferFrom(IERC20(tokenAddr), msg.sender, ntfSell.seller, price);

        ntf.safeTransferFrom(address(this), msg.sender, _tokenId);

        ntfSell.active = false;

        emit NTFSoldEvent(_tokenId, price, msg.sender);
    }

    function onERC721Received(address, address, uint256, bytes memory) external virtual override returns (bytes4){
        return this.onERC721Received.selector;
    }

}