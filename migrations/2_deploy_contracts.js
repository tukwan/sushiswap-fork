const Factory = artifacts.require('uniswapv2/UniswapV2Factory')
const Router = artifacts.require('uniswapv2/UniswapV2Router02')
const WETH = artifacts.require('WETH')
const TokenA = artifacts.require('TokenA')
const TokenB = artifacts.require('TokenB')
const SushiToken = artifacts.require('SushiToken')
const MasterChef = artifacts.require('MasterChef')
const SushiBar = artifacts.require('SushiBar')
const SushiMaker = artifacts.require('SushiMaker')
const Migrator = artifacts.require('Migrator')

module.exports = async function (deployer, _network, addresses) {
  const [admin, _] = addresses

  await deployer.deploy(WETH)
  const weth = await WETH.deployed()

  await deployer.deploy(TokenA, 'Token A', 'TKA', web3.utils.toWei('1000'))
  const tokenA = await TokenA.deployed()
  await deployer.deploy(TokenB, 'Token B', 'TKB', web3.utils.toWei('1000'))
  const tokenB = await TokenB.deployed()

  await deployer.deploy(Factory, admin)
  const factory = await Factory.deployed()
  await factory.createPair(weth.address, tokenA.address)
  await factory.createPair(weth.address, tokenB.address)

  await deployer.deploy(Router, factory.address, weth.address)
  const router = await Router.deployed()

  await deployer.deploy(SushiToken)
  const sushiToken = await SushiToken.deployed()

  //yield farming 1
  await deployer.deploy(MasterChef, sushiToken.address, admin, web3.utils.toWei('100'), 1, 10)
  const masterChef = await MasterChef.deployed()
  await sushiToken.transferOwnership(masterChef.address)

  //yield farming 2
  await deployer.deploy(SushiBar, sushiToken.address)
  const sushiBar = await SushiBar.deployed()

  await deployer.deploy(SushiMaker, factory.address, sushiBar.address, sushiToken.address, weth.address)
  const sushiMaker = await SushiMaker.deployed()
  await factory.setFeeTo(sushiMaker.address) //admin -> msg.sender

  //migrator
  await deployer.deploy(Migrator, masterChef.address, '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', factory.address, 1)
}
