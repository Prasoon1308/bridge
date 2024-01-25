// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./IToken.sol";

contract BridgeL1{
    address public owner;
    IToken public token;
    mapping(address=>uint256) accountBalance;


    event DepositLog (
        address indexed from,
        address indexed to,
        uint256 indexed amount
    );

    event WithdrawLog (
        address indexed from,
        address indexed to,
        uint256 indexed amount
    );

    constructor(address _token){
        owner = msg.sender;
        token = IToken(_token);
    }


    function deposit(
        uint256 amount
    ) external {
        require(token.balance(msg.sender)>=amount, "Not sufficient balance to lock");
        accountBalance[msg.sender] += amount;
        token.transfer(msg.sender, address(this), amount);
        emit DepositLog(msg.sender, address(this), amount);
    }

    function withdraw(
        uint256 amount
    ) external {
        require(accountBalance[msg.sender]>=amount, "Not sufficient balance locked");
        accountBalance[msg.sender] -= amount;
        token.transfer(address(this), msg.sender, amount);
        emit WithdrawLog(msg.sender, address(this), amount);
    }
}