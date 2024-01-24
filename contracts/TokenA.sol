// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./TokenBase.sol";

contract TokenA is TokenBase {
    constructor() TokenBase("Token A", "TA") {}
}