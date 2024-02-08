// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenBase.sol";

contract TokenL2 is TokenBase {
    constructor(string memory name, string memory symbol) TokenBase(name, symbol) {}
}