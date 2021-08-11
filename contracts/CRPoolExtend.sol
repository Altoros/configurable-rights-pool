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

contract CRPoolExtend is Proxy, ERC1155Holder {
    address public immutable implementation;
    address public immutable exchangeProxy;

    constructor(
        address _poolImpl,
        address _exchProxy,
        bytes memory _data
    ) public {
        implementation = _poolImpl;
        exchangeProxy = _exchProxy;

        if (_data.length > 0) {
            Address.functionDelegateCall(_poolImpl, _data);
        }
    }

    function _implementation() internal view override returns (address) {
        return implementation;
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
