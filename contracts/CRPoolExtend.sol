// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.12;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol";
interface IBPools {
    function createPool(
        uint256 initialSupply,
        uint256 minimumWeightChangeBlockPeriodParam,
        uint256 addTokenTimeLockInBlocksParam
    ) external;

    function createPool(uint256 initialSupply) external;

    function updateWeight(address token, uint256 newWeight) external;

    function updateWeightsGradually(
        uint256[] calldata newWeights,
        uint256 startBlock,
        uint256 endBlock
    ) external;

    function pokeWeights() external;

    function commitAddToken(
        address token,
        uint256 balance,
        uint256 denormalizedWeight
    ) external;

    function applyAddToken() external;

    function removeToken(address token) external;

    function joinPool(uint256 poolAmountOut, uint256[] calldata maxAmountsIn)
        external;

    function exitPool(uint256 poolAmountIn, uint256[] calldata minAmountsOut)
        external;

    function joinswapExternAmountIn(
        address tokenIn,
        uint256 tokenAmountIn,
        uint256 minPoolAmountOut
    ) external;

    function joinswapPoolAmountOut(
        address tokenIn,
        uint256 poolAmountOut,
        uint256 maxAmountIn
    ) external;

    function exitswapPoolAmountIn(
        address tokenOut,
        uint256 poolAmountIn,
        uint256 minAmountOut
    ) external;

    function exitswapExternAmountOut(
        address tokenOut,
        uint256 tokenAmountOut,
        uint256 maxPoolAmountIn
    ) external;
}

contract CRPoolExtend is Proxy, ERC1155Holder  {
    address public implementation;
    address public immutable exchangeProxy;

     /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Emitted when the implementation is upgraded.
     */
    event Upgraded(address indexed implementation);
    constructor(
        address _poolImpl,
        address _exchProxy,
        bytes memory _data
    ) public {
        implementation = _poolImpl;
        exchangeProxy = _exchProxy;
        assert(_IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1));
        _setImplementation(_poolImpl);
        if (_data.length > 0) {
            Address.functionDelegateCall(_poolImpl, _data);
        }
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view override returns (address) {
        return implementation;
    }

    /**
     * @dev Upgrades the proxy to a new implementation.
     *
     * Emits an {Upgraded} event.
     */
    function upgradeTo(address newImplementation) public {
        _setImplementation(newImplementation);
        implementation = newImplementation;
        emit Upgraded(newImplementation);
    }

    /**
     * @dev Stores a new address in the EIP1967 implementation slot.
     */
    function _setImplementation(address newImplementation) private {
        require(Address.isContract(newImplementation), "UpgradeableProxy: new implementation is not a contract");

        bytes32 slot = _IMPLEMENTATION_SLOT;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, newImplementation)
        }
    }

    function _beforeFallback() internal override {
        _onlyExchangeProxy();
    }

    function _onlyExchangeProxy() internal view {
        if (
            msg.sig ==
            bytes4(keccak256("createPool(uint256,uint256,uint256)")) ||
            msg.sig == bytes4(keccak256("createPool(uint256)")) ||
            msg.sig == IBPools.updateWeight.selector ||
            msg.sig == IBPools.updateWeightsGradually.selector ||
            msg.sig == IBPools.pokeWeights.selector ||
            msg.sig == IBPools.commitAddToken.selector ||
            msg.sig == IBPools.applyAddToken.selector ||
            msg.sig == IBPools.removeToken.selector ||
            msg.sig == IBPools.joinPool.selector ||
            msg.sig == IBPools.exitPool.selector ||
            msg.sig == IBPools.joinswapExternAmountIn.selector ||
            msg.sig == IBPools.joinswapPoolAmountOut.selector ||
            msg.sig == IBPools.exitswapPoolAmountIn.selector ||
            msg.sig == IBPools.exitswapExternAmountOut.selector
        ) {
            require(msg.sender == exchangeProxy, "ERR_NOT_EXCHANGE_PROXY");
        }
    }
}
