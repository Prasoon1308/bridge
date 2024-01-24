// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./TokenBase.sol";

contract TokenB is TokenBase {
    constructor() TokenBase("Token B", "TB") {}
}