// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IToken.sol";

contract BridgeL2 {
    address public owner;
    IToken public token;

    enum Step {
        Burn,
        Mint
    }

    constructor(address _token) {
        owner = msg.sender;
        token = IToken(_token);
    }

    function burn(
        address to,
        uint256 amount
    ) external {
        token.burn(to, amount);
    }

    function mint(
        address to,
        uint256 amount
    ) external {
        token.mint(to, amount);
    }
}