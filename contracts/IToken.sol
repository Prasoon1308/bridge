// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IToken {
    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;

    function transfer(address from, address to, uint256 amount) external;

    function balance(address account) external view returns(uint256);
}