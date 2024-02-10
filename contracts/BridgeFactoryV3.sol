// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/TokenL1.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// To be deployed on L1
contract BridgeFactoryV3 is Ownable(msg.sender) {
    using ECDSA for bytes32;

    // EIP-712 domain separator
    bytes32 private immutable DOMAIN_SEPARATOR;

    // EIP-712 type hash for Counter
    bytes32 private constant WITHDRAWAL_TYPEHASH =
        keccak256(
            "WithdrawOnL1(address childToken,address userAddress,uint256 amount,uint256 transactionNonce)"
        );

    address public signatureAddress;

    mapping(address => address) public rootToChild;
    mapping(address => address) public childToRoot;
    // track nonces per user address
    mapping(address => uint256) public nonce;

    event DepositLog(
        address indexed rootTokenAddress,
        address indexed from,
        uint256 indexed amount,
        uint256 nonce
    );

    event WithdrawLog(
        address indexed rootTokenAddress,
        address indexed to,
        uint256 indexed amount,
        uint256 nonce
    );

    constructor(address adminAddress) {
        signatureAddress = adminAddress;

        // Set up EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("BridgeFactoryV3"),
                keccak256("3"),
                block.chainid,
                address(this)
            )
        );
    }

    function checkBridge(address _rootToken) external view returns (address) {
        return rootToChild[_rootToken];
    }

    function setBridge(
        address _rootToken,
        address _childToken
    ) external onlyOwner {
        rootToChild[_rootToken] = _childToken;
        childToRoot[_childToken] = _rootToken;
    }

    function validateSignature(
        address _childToken,
        uint256 _amount,
        uint256 _nonce,
        bytes memory _signature
    ) internal view returns (address) {
        // Verify the signature using EIP-712
        bytes32 structHash = keccak256(
            abi.encode(
                WITHDRAWAL_TYPEHASH,
                _childToken,
                msg.sender,
                _amount,
                _nonce
            )
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        address signer = digest.recover(_signature);

        return signer;
    }

    function depositOnL1(address _rootToken, uint256 _amount) external {
        TokenL1 tokenL1 = TokenL1(_rootToken);
        nonce[msg.sender]++;
        tokenL1.transfer(msg.sender, address(this), _amount);
        emit DepositLog(_rootToken, msg.sender, _amount, nonce[msg.sender]);
    }

    function withdrawOnL1(
        bytes memory _data,
        bytes memory _signature
    ) external {
        // decode the data into childTokenAddress and amount
        (
            bytes32 a,
            address _childToken,
            address b,
            uint256 _amount,
            uint256 _nonce
        ) = abi.decode(_data, (bytes32, address, address, uint256, uint256));

        address signer = validateSignature(
            _childToken,
            _amount,
            _nonce,
            _signature
        );
        // check signer is the admin & the nonce used by the user is unique
        require(
            signer == signatureAddress && _nonce == nonce[msg.sender] + 1,
            "Invalid signature or nonce"
        );

        TokenL1 tokenL1 = TokenL1(childToRoot[_childToken]);
        nonce[msg.sender]++;
        tokenL1.transfer(address(this), msg.sender, _amount);
        emit WithdrawLog(
            childToRoot[_childToken],
            msg.sender,
            _amount,
            nonce[msg.sender]
        );
    }
}
