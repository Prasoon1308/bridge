// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/TokenL2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract BridgeDeployerV3 is Ownable(msg.sender){
   using ECDSA for bytes32;

    //?  track nonces signature address

    // EIP-712 domain separator
    bytes32 private immutable DOMAIN_SEPARATOR;

    // EIP-712 type hash for Counter
    bytes32 private constant MINT_TYPEHASH =
        keccak256("MintOnL2(address rootToken,address userAddress,uint256 amount)");

    address public signatureAddress;

    mapping(address => address) public rootToChild;
    mapping(address => address) public childToRoot;

    event bridgeDeployedLog(
        address indexed rootTokenAddress,
        address indexed childTokenAddress
    );
    event mintLog(
        address indexed childTokenAddress,
        address indexed to,
        uint256 indexed amount
    );

    event burnLog(
        address indexed childTokenAddress,
        address indexed from,
        uint256 indexed amount
    );

    constructor(address adminAddress) {
        require(adminAddress != address(0), "Invalid admin address!");
        signatureAddress = adminAddress;

        // Set up EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("BridgeDeployerV3"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    function checkBridge(address _childToken) external view returns(address){
        return childToRoot[_childToken];
    }

    function newBridgeDeploy(address _rootToken, string memory _name, string memory _symbol) external onlyOwner  returns(address _childToken){
        require(rootToChild[_rootToken] == address(0), "Bridge is already existing!");
        TokenL2 tokenL2 = new TokenL2(_name, _symbol);
        _childToken = address(tokenL2);
        rootToChild[_rootToken] = _childToken;
        childToRoot[_childToken] = _rootToken;
        emit bridgeDeployedLog(_rootToken, _childToken);
    }

    function validateSignature(
       address _rootToken,
       uint256 _amount,
        bytes memory _signature
    ) internal view returns (address) {
        // Verify the signature using EIP-712
        bytes32 structHash = keccak256(
            abi.encode(MINT_TYPEHASH, _rootToken, msg.sender,_amount)
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        address signer = digest.recover(_signature);

        return signer;
    }

    function mintOnL2(bytes memory _data, bytes calldata _signature) external  {
        // decode the data into childTokenAddress and amount 
        (bytes32 a, address _rootToken, address b, uint256 _amount) = abi.decode(_data, (bytes32, address, address, uint256));

        require(rootToChild[_rootToken] != address(0), "Let the child token be deployed first!");    

        address signer = validateSignature(_rootToken, _amount, _signature);
        // check signer is the admin
        require(
            signer == signatureAddress,
            "Invalid signature"
        );
        TokenL2 tokenL2 = TokenL2(rootToChild[_rootToken]);
        tokenL2.mint(msg.sender, _amount);
        emit mintLog(rootToChild[_rootToken], msg.sender, _amount);
    }

    function burnOnL2(address _childToken, uint256 _amount) external {
        TokenL2 tokenL2 = TokenL2(_childToken);
        tokenL2.burn(msg.sender, _amount);
        emit burnLog(_childToken, msg.sender, _amount);
    }

}