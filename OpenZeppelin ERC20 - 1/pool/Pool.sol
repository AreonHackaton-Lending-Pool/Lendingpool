// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pool is ERC20 {
    string public tokenSymbol;
    address public tokenAddress;

    struct Liquidity {
        address owner;
        uint256 amount;
        uint256 timestamp;
    }
    event DebugStatement(string, uint256);

    Liquidity[] public transactions;
    mapping(address => uint256) public balances;

    constructor(string memory _tokenSymbol, address _tokenAddress)
        ERC20(_tokenSymbol, _tokenSymbol)
    {
        tokenAddress = _tokenAddress;
        tokenSymbol = _tokenSymbol;
    }

    modifier hasUserLiqudity(uint256 amount) {
        require(balances[msg.sender] >= amount, "User hasnt enough limit");
        _;
    }

    // function addLiquidity() external payable returns (uint256) {
    //     balances[msg.sender] += msg.value;
    //     transactions. push(Liquidity(msg.sender, msg.value, block.timestamp));
    //     mint(msg.sender, msg.value);
    //     return transactions.length - 1;
    // }

    function deposit() external payable {
        // require(msg.sender == tokenAddress, "Caller is not the token contract");
        // require(balances[account] >= amount, "User hasn't enough limit");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external payable hasUserLiqudity(amount) {
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");
        transactions.push(Liquidity(msg.sender, amount, block.timestamp));
        balances[msg.sender] -= amount;
    }

    function getAllTransactions() external view returns (Liquidity[] memory) {
        return transactions;
    }

    function mint(address account, uint256 amount) internal {
        // require(msg.sender == tokenAddress, "Caller is not the token contract");
        mintsToken(account, amount);
    }

    function mintsToken(address account, uint256 amount) internal {
        _mint(account, amount);
    }
}
