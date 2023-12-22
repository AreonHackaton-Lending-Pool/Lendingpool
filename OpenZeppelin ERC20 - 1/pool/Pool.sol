// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Pool {

    string tokenSymbol;
    address tokenAddress;

    struct Liquidity {
        address owner;
        uint256 amount;
        uint timestamp;
    }

    Liquidity[] public userLiqudity;
    mapping(address => uint256) public  userLimit;

    constructor(string memory _tokenSymbol,address _tokenAddress){
        tokenAddress = _tokenAddress;
        tokenSymbol = _tokenSymbol;
    }

    modifier hasUserLiqudity(uint256 amount) {
        require(userLimit[msg.sender] >= amount,"User hasnt enough limit");
        _;
    }

    function addLiquidity() payable external returns(uint256) {
        userLimit[msg.sender] += msg.value;
        userLiqudity.push(Liquidity(msg.sender,msg.value,block.timestamp));
        return userLiqudity.length - 1;
    }

    function withdraw(uint256 amount) payable external hasUserLiqudity(amount){
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");
        userLimit[msg.sender] -= amount;
    }


}