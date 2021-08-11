// @ts-nocheck
/* eslint-env es6 */

const BFactory = artifacts.require('BFactory');
const BPool = artifacts.require('BPool');
const ConfigurableRightsPool = artifacts.require('ConfigurableRightsPool');
const CRPFactory = artifacts.require('CRPFactory');
const CRPoolExtend = artifacts.require('CRPoolExtend');
const TToken = artifacts.require('TToken');
const truffleAssert = require('truffle-assertions');
const Decimal = require('decimal.js');
const { calcRelativeDiff } = require('../lib/calc_comparisons');
const { assert } = require('chai');


const verbose = process.env.VERBOSE;

contract('CRPoolExtend', (accounts) => {
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const { toWei, fromWei } = web3.utils;
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const MAX = web3.utils.toTwosComplement(-1);
    const errorDelta = 10 ** -8;
    // These are the initial settings for newCrp:
    const swapFee = toWei('0.003');
    const startWeights = [toWei('12'), toWei('1.5'), toWei('1.5')];
    const startBalances = [toWei('80000'), toWei('40'), toWei('10000')];
    const SYMBOL = (Math.random() + 1).toString(36).substring(7); // 'BSP';
    const NAME = "SWARM MARKET SMART POOL";

    const permissions = {
        canPauseSwapping: true,
        canChangeSwapFee: true,
        canChangeWeights: true,
        canAddRemoveTokens: true,
        canWhitelistLPs: false,
        canChangeCap: false,
    };
    let crpFactory; let bFactory; let bPool; let
        crpPool;
    let CRPPOOL;
    let CRPPOOL_ADDRESS;
    let WETH;
    let DAI;
    let XYZ;
    let XXX;
    let weth;
    let dai;
    let xyz;
    let xxx;
    before(async () => {
        bFactory = await BFactory.deployed();
        crpFactory = await CRPFactory.deployed();
        xyz = await TToken.new('XYZ', 'XYZ', 18);
        weth = await TToken.new('Wrapped Ether', 'WETH', 18);
        dai = await TToken.new('Dai Stablecoin', 'DAI', 18);
        xxx = await TToken.new('XXX', 'XXX', 18);

        WETH = weth.address;
        DAI = dai.address;
        XYZ = xyz.address;
        XXX = xxx.address;

        // admin balances
        await weth.mint(admin, toWei('100'));
        await dai.mint(admin, toWei('15000'));
        await xyz.mint(admin, toWei('100000'));

        const poolParams = {
            poolTokenSymbol: SYMBOL,
            poolTokenName: NAME,
            constituentTokens: [XYZ, WETH, DAI],
            tokenBalances: startBalances,
            tokenWeights: startWeights,
            swapFee: swapFee,
        }

        CRPPOOL = await crpFactory.newCrp.call(
            bFactory.address,
            poolParams,
            permissions,
        );

        await crpFactory.newCrp(
            bFactory.address,
            poolParams,
            permissions,
        );

        crpPool = await CRPoolExtend.initialize(CRPPOOL);

        CRPPOOL_ADDRESS = crpPool.address;

        await weth.approve(CRPPOOL_ADDRESS, MAX);
        await dai.approve(CRPPOOL_ADDRESS, MAX);
        await xyz.approve(CRPPOOL_ADDRESS, MAX);
    });

    it('crpPool should have no BPool before creation', async () => {
        const bPoolAddr = await crpPool.bPool();
        assert.equal(bPoolAddr, ZERO_ADDRESS);
    });

    it('crpPool should have admin account as controller', async () => {
        const controllerAddr = await crpPool.getController.call();
        assert.equal(controllerAddr, admin);
    });

    if ('crpPool should not allow changing controller from non-admin', async () => {
        await truffleAssert.reverts(
            crpPool.setController(user1, { from: user1 }),
            "ERR_NOT_CONTROLLER"
        );
    });

    if ('crpPool should not allow changing controller to zero', async () => {
        await truffleAssert.reverts(
            crpPool.setController(ZERO_ADDRESS),
            "ERR_ZERO_ADDRESS"
        );
    });

    if ('crpPool should allow changing controller by admin', async () => {
        await crpPool.setController(user1);
        let controllerAddr = await crpPool.getController.call();
        assert.equal(controllerAddr, user1);

        await crpPool.setController(admin);
        controllerAddr = await crpPool.getController.call();
        assert.equal(controllerAddr, admin);
    });

    it('crpPool should have all rights set to true', async () => {
        let x;
        for (x = 0; x < permissions.length; x++) {
            const perm = await crpPool.hasPermission(x);
            assert.isTrue(perm);
        }
    });

    it('Admin should have no initial BPT', async () => {
        const adminBPTBalance = await crpPool.balanceOf.call(admin);
        assert.equal(adminBPTBalance, toWei('0'));
    });

    it('crpPool should not createPool with 0 BPT Initial Supply', async () => {
        await truffleAssert.reverts(
            crpPool.createPool(toWei('0')),
            'ERR_INIT_SUPPLY_MIN',
        );
    });

    it('crpPool should not createPool with BPT Initial Supply < MIN', async () => {
        await truffleAssert.reverts(
            crpPool.createPool(toWei('10')),
            'ERR_INIT_SUPPLY_MIN',
        );
    });

    it('crpPool should not createPool with BPT Initial Supply > MAX', async () => {
        await truffleAssert.reverts(
            crpPool.createPool(toWei('1000000001')),
            'ERR_INIT_SUPPLY_MAX',
        );
    });

    it('Non controller should not be able to createPool', async () => {
        await truffleAssert.reverts(
            crpPool.createPool(toWei('100'), { from: user1 }),
            'ERR_NOT_CONTROLLER',
        );
    });

    it('Non controller should not be able to createPool (with time params)', async () => {
        await truffleAssert.reverts(
            crpPool.createPool(toWei('100', 0, 0), { from: user1 }),
            'ERR_NOT_CONTROLLER',
        );
    });

    it('crpPool should have a BPool after creation', async () => {
        await crpPool.createPool(toWei('100'));
        const bPoolAddr = await crpPool.bPool();
        assert.notEqual(bPoolAddr, ZERO_ADDRESS);
        bPool = await BPool.at(bPoolAddr);
    });

    it('should not be able to createPool twice', async () => {
        await truffleAssert.reverts(
            crpPool.createPool(toWei('100')),
            'ERR_IS_CREATED',
        );
    });

    it('crpPool should not be able to set the cap without the right', async () => {
        await truffleAssert.reverts(
            crpPool.setCap(toWei('1000')),
            'ERR_CANNOT_CHANGE_CAP',
        );
    });

    it('BPool should have matching swap fee', async () => {
        const deployedSwapFee = await bPool.getSwapFee();
        assert.equal(swapFee, deployedSwapFee);
    });

    it('BPool should have public swaps enabled', async () => {
        const isPublicSwap = await bPool.isPublicSwap();
        assert.equal(isPublicSwap, true);
    });
})