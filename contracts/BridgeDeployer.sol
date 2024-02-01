// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/TokenL2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeDeployer is Ownable(msg.sender){
    mapping(address => address) rootToChild;
    
    event bridgeDeployedLog(
        address indexed rootTokenAddress,
        address indexed childTokenAddress
    );
    event mintLog(
        address indexed rootTokenAddress,
        address indexed to,
        uint256 indexed amount
    );

    event burnLog(
        address indexed rootTokenAddress,
        address indexed from,
        uint256 indexed amount
    );

    function checkBridge(address _rootToken) external view returns(address){
        return rootToChild[_rootToken];
    }

    function newBridgeDeploy(address _rootToken, string memory _name, string memory _symbol) private  {
        TokenL2 tokenL2 = new TokenL2(_name, _symbol);
        address _childToken = address(tokenL2);
        rootToChild[_rootToken] = _childToken;
        emit bridgeDeployedLog(_rootToken, _childToken);
    }

    function mintOnL2(address _rootToken, address _userAddress, uint256 _amount) external onlyOwner {
        if (rootToChild[_rootToken] == address(0)) {
            newBridgeDeploy(_rootToken, "TokenL2", "TL2");
        }
        TokenL2 tokenL2 = TokenL2(rootToChild[_rootToken]);
        tokenL2.mint(_userAddress, _amount);
        emit mintLog(_rootToken, _userAddress, _amount);
    }
    function burnOnL2(address _rootToken, uint256 _amount) external {
        TokenL2 tokenL2 = TokenL2(rootToChild[_rootToken]);
        tokenL2.burn(msg.sender, _amount);
        emit burnLog(_rootToken, msg.sender, _amount);
    }
}