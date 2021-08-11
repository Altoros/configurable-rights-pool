
const Web3 = require('web3');
const RightsManager = artifacts.require('RightsManager');
const SmartPoolManager = artifacts.require('SmartPoolManager');
const CRPFactory = artifacts.require('CRPFactory');
const CRPoolExtend = artifacts.require('CRPoolExtend');
const BFactory = artifacts.require('BFactory');
const BalancerSafeMath = artifacts.require('BalancerSafeMath');
const BalancerSafeMathMock = artifacts.require('BalancerSafeMathMock');
const TToken = artifacts.require('TToken');
const CRPool = artifacts.require('ConfigurableRightsPool')
module.exports = async function (deployer, network, accounts) {
    // if (network === 'development' || network === 'coverage') {
    let impl = await deployer.deploy(BFactory);
    let implode = await deployer.deploy(BalancerSafeMathMock);
    const swapFee = Web3.utils.toWei('0.003');
    const startWeights = [Web3.utils.toWei('12'), Web3.utils.toWei('1.5'), Web3.utils.toWei('1.5')];
    const startBalances = [Web3.utils.toWei('80000'), Web3.utils.toWei('40'), Web3.utils.toWei('10000')];
    let xyz = await TToken.new('XYZ', 'XYZ', 18);
    let weth = await TToken.new('Wrapped Ether', 'WETH', 18);
    let dai = await TToken.new('Dai Stablecoin', 'DAI', 18);
    let WETH = weth.address;
    let DAI = dai.address;
    let XYZ = xyz.address;
    const poolParams = {
        poolTokenSymbol: "SYM",
        poolTokenName: "NAME",
        constituentTokens: [XYZ, WETH, DAI],
        tokenBalances: startBalances,
        tokenWeights: startWeights,
        swapFee: swapFee,
    }

    await deployer.deploy(BalancerSafeMath);
    await deployer.deploy(RightsManager);
    await deployer.deploy(SmartPoolManager);
    deployer.link(BalancerSafeMath, CRPFactory);
    deployer.link(RightsManager, CRPFactory);
    deployer.link(SmartPoolManager, CRPFactory);
    deployer.link(BalancerSafeMath, CRPoolExtend);
    deployer.link(RightsManager, CRPoolExtend);
    deployer.link(SmartPoolManager, CRPoolExtend);
    var crpIml = await deployer.deploy(CRPool);
    const crPoolExtend = await deployer.deploy(CRPoolExtend, [crpIml.address, accounts[0], ["0x6d6168616d000000000000000000000000000000000000000000000000000000", "0x4300000000000000000000000000000000000000000000000000000000000000", "0x53696c7665720000000000000000000000000000000000000000000000000000", "0x666972737420746f6b656e000000000000000000000000000000000000000000", "0x696d6167652075726c0000000000000000000000000000000000000000000000"]]);
    console.log(crPoolExtend.address);
    console.log(crPoolExtend.address)
    await deployer.deploy(CRPFactory, [crPoolExtend.address]);

    // }
};
