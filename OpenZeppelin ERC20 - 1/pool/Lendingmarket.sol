// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Pool.sol";

contract LendingMarket {

    mapping(string => address) public  poolData;
    string[] public assets;

    event PoolIsCreated(address poolAddress);

    modifier isPoolExists(string calldata tokenSymbol) {
        require(poolData[tokenSymbol] == address(0),"Pool for the token is created");
        _;
    }

    function createPool(string calldata tokenSymbol, address tokenAddress) external isPoolExists(tokenSymbol){
        address poolAddress = address(new Pool(tokenSymbol,tokenAddress));
        emit PoolIsCreated(poolAddress);
        assets.push(tokenSymbol);
        poolData[tokenSymbol] = poolAddress;
    }

    function getPoolAddressForToken(string calldata tokenSymbol) view external returns(address){
        return poolData[tokenSymbol];
    }

    function getAllAssets() view external returns(string[] memory){
        return assets;
    }

}