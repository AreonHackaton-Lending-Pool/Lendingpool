// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LendingPool.sol";

contract LendingMarket {
    
    address private owner_cem = 0x1d41d444dFfd5dd01E9ea6291D7Fa602D0dA0d95;
    address private owner_seyit = 0x4920c838DC16E6207c46b4539B690ef8298cd69B;
    address private owner_esref = 0x6FBB65a43354Ea72f38b2afCb346F0C2FBB80946;
    string[] public assets;
    mapping(string => address) public poolData;
    
    event poolIsCreated(address poolAddress);

    modifier onlyOwner() {
        require(msg.sender == owner_cem || msg.sender == owner_seyit || msg.sender == owner_esref,
        "You are not the owner");
        _;
    }

    modifier isPoolExist(string calldata tokenSymbol) {
        require(poolData[tokenSymbol] == address(0),
        "Pool for the token is created");
        _;
    }

    function createPool(string calldata tokenSymbol, address tokenAddress) external isPoolExist(tokenSymbol) onlyOwner {
        address poolAddress = address(new LendingPool(tokenSymbol, tokenAddress));
        emit poolIsCreated(poolAddress);
        assets.push(tokenSymbol);
        poolData[tokenSymbol] = poolAddress;
    }

    function getPoolAddressForToken(string calldata tokenSymbol) view external returns(address) {
        return poolData[tokenSymbol];
    }

    function getAllAssets() view external returns(string[] memory) {
        return assets;
    }
}
