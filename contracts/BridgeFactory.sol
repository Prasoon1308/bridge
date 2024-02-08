// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/TokenBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeFactory is Ownable(msg.sender){
    mapping(address => address) public rootToChild;
    mapping(address => address) public childToRoot;

    event DepositLog (
        address indexed rootTokenAddress,
        address indexed from,
        uint256 indexed amount
    );

    event WithdrawLog (
        address indexed rootTokenAddress,
        address indexed to,
        uint256 indexed amount
    );

    function checkBridge(address _rootToken) external view returns(address){
        return rootToChild[_rootToken];
    }
    function setBridge(address _rootToken, address _childToken) external onlyOwner{
        rootToChild[_rootToken] = _childToken;
        childToRoot[_childToken] = _rootToken;
    }

    function depositOnL1(address _rootToken, uint256 _amount) external {
        TokenBase token = TokenBase(_rootToken);
        require(token.balance(msg.sender)>=_amount, "Not sufficient balance!"); //! approval
        token.transfer(msg.sender, address(this), _amount);
        emit DepositLog(_rootToken, msg.sender, _amount);
    }

    function withdrawOnL1(address _childToken, address _userAddress, uint256 _amount) external onlyOwner {
        TokenBase token = TokenBase(childToRoot[_childToken]);
        emit WithdrawLog(childToRoot[_childToken],  _userAddress, _amount);
        token.transfer(address(this), _userAddress, _amount);
    }
}