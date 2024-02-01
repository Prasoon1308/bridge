// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/TokenBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeFactory is Ownable(msg.sender){
    mapping(address => address) rootToChild;

    event DepositLog (
        address indexed tokenAddress,
        address indexed from,
        uint256 indexed amount
    );

    event WithdrawLog (
        address indexed tokenAddress,
        address indexed to,
        uint256 indexed amount
    );

    function checkBridge(address _token) external view returns(address){
        return rootToChild[_token];
    }
    function setBridge(address _rootToken, address _childToken) external onlyOwner{
        rootToChild[_rootToken] = _childToken;
    }

    function depositOnL1(address _token, uint256 _amount) external {
        TokenBase token = TokenBase(_token);
        require(token.balance(msg.sender)>=_amount, "Not sufficient balance!");
        token.transfer(msg.sender, address(this), _amount);
        emit DepositLog(_token, msg.sender, _amount);
    }

    function withdrawOnL1(address _rootToken, address _userAddress, uint256 _amount) external onlyOwner {
        TokenBase token = TokenBase(_rootToken);
        emit WithdrawLog(_rootToken,  _userAddress, _amount);
        token.transfer(address(this), _userAddress, _amount);
    }
}