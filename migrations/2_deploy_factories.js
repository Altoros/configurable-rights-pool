
const Web3 = require('web3');
const RightsManager = artifacts.require('RightsManager');
const SmartPoolManager = artifacts.require('SmartPoolManager');
const CRPFactory = artifacts.require('CRPFactory');
const CRPoolExtend = artifacts.require('CRPoolExtend');
const BFactory = artifacts.require('BFactory');
const BalancerSafeMath = artifacts.require('BalancerSafeMath');
const BalancerSafeMathMock = artifacts.require('BalancerSafeMathMock');
const TToken = artifacts.require('TToken');
const SafeApprove = artifacts.require('SafeApprove');
const CRPool = artifacts.require('ConfigurableRightsPool');
module.exports = async function (deployer, network, accounts) {
    // if (network === 'development' || network === 'coverage') {
    // let impl = await deployer.deploy(BFactory);
    // let implode = await deployer.deploy(BalancerSafeMathMock);
    // const swapFee = Web3.utils.toWei('0.003');
    // const startWeights = [Web3.utils.toWei('12'), Web3.utils.toWei('1.5'), Web3.utils.toWei('1.5')];
    // const startBalances = [Web3.utils.toWei('80000'), Web3.utils.toWei('40'), Web3.utils.toWei('10000')];
    // let xyz = await TToken.new('XYZ', 'XYZ', 18);
    // let weth = await TToken.new('Wrapped Ether', 'WETH', 18);
    // let dai = await TToken.new('Dai Stablecoin', 'DAI', 18);
    // let WETH = weth.address;
    // let DAI = dai.address;
    // let XYZ = xyz.address;
    // const poolParams = {
    //     poolTokenSymbol: "SYM",
    //     poolTokenName: "NAME",
    //     constituentTokens: [XYZ, WETH, DAI],
    //     tokenBalances: startBalances,
    //     tokenWeights: startWeights,
    //     swapFee: swapFee,
    // }

    console.log('accounts: ', accounts[0]);
    await deployer.deploy(BalancerSafeMath);
    await deployer.deploy(RightsManager);
    await deployer.deploy(SmartPoolManager);
    await deployer.deploy(SafeApprove);
    deployer.link(BalancerSafeMath, CRPFactory);
    deployer.link(RightsManager, CRPFactory);
    deployer.link(SmartPoolManager, CRPFactory);
    deployer.link(BalancerSafeMath, CRPoolExtend);
    deployer.link(RightsManager, CRPoolExtend);
    deployer.link(SmartPoolManager, CRPoolExtend);
    deployer.link(BalancerSafeMath, CRPool);
    deployer.link(RightsManager, CRPool);
    deployer.link(SafeApprove, CRPool);
    deployer.link(SmartPoolManager, CRPool);
    var crpIml = await deployer.deploy(CRPool);
    console.log('ConfigRightPool: ', crpIml.address);
    const crPoolExtend = await deployer.deploy(CRPoolExtend, crpIml.address, accounts[0], []);
    console.log('CRPoolExtend: ', crPoolExtend.address);
    var crpFactory = await deployer.deploy(CRPFactory, crpIml.address);
    console.log('CRPFactory: ', crpFactory.address);
    // }
};
