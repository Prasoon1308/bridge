// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IToken.sol";

contract BridgeBase {
    address public owner;
    IToken public token;

    enum Step {
        Burn,
        Mint
    }

    event Transfer(
        address from,
        address to,
        uint256 amount,
        Step indexed step
    );

    constructor(address _token) {
        owner = msg.sender;
        token = IToken(_token);
    }

    function burn(
        address to,
        uint256 amount
    ) external {
        token.burn(msg.sender, amount);
        emit Transfer(
            msg.sender,
            to,
            amount,
            Step.Burn
        );
    }

    function mint(
        address from,
        address to,
        uint256 amount
    ) external {
        token.mint(to, amount);
        emit Transfer(
            from,
            to,
            amount,
            Step.Mint
        );
    }
}