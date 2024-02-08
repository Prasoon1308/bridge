// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenBase is ERC20, Ownable(msg.sender){

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}


    function mint(address account, uint256 amount) external onlyOwner{
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external onlyOwner{
        _burn(account, amount);
    }

    function transfer(address from, address to, uint256 amount) external {
        _transfer(from, to, amount);
    }

    function balance(address account) external view returns(uint256){
        return balanceOf(account);
    }
}