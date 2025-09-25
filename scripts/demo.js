const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();

  console.log("🚀 Starting Uniswap V2 Demo");
  console.log("============================");

  console.log("\n📦 Step 1: Deploying Uniswap V2 Contracts");
  console.log("-----------------------------------------");

  // Deploy Factory
  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.deploy(owner.address);
  await factory.deployed();
  console.log("✅ Factory deployed at:", factory.address);

  // Deploy tokens
  const MyToken = await ethers.getContractFactory("MyToken");
  const tokenA = await MyToken.deploy("TokenA", "TKA", ethers.utils.parseEther("1000000"));
  await tokenA.deployed();
  console.log("✅ TokenA deployed at:", tokenA.address);

  const tokenB = await MyToken.deploy("TokenB", "TKB", ethers.utils.parseEther("1000000"));
  await tokenB.deployed();
  console.log("✅ TokenB deployed at:", tokenB.address);

  const tokenC = await MyToken.deploy("TokenC", "TKC", ethers.utils.parseEther("1000000"));
  await tokenC.deployed();
  console.log("✅ TokenC deployed at:", tokenC.address);

  const tokenD = await MyToken.deploy("TokenD", "TKD", ethers.utils.parseEther("1000000"));
  await tokenD.deployed();
  console.log("✅ TokenD deployed at:", tokenD.address);

  console.log("\n🎉 Uniswap V2 contracts deployed successfully!");

  console.log("\n🏊 Step 2: Setting Up Liquidity Pools");
  console.log("-----------------------------------");

  // Create a pool
  console.log("\n🔗 Creating pool for TokenA and TokenB...");
  await factory.createPair(tokenA.address, tokenB.address);
  const pairAB = await factory.getPair(tokenA.address, tokenB.address);
  console.log("✅ Pool A-B created at:", pairAB);

  // Add liquidity
  const amountA = ethers.utils.parseEther("1000");
  const amountB = ethers.utils.parseEther("1000");

  console.log("\n💰 Adding liquidity to pool A-B (1000 A + 1000 B)...");
  await tokenA.approve(pairAB, amountA);
  await tokenB.approve(pairAB, amountB);

  const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
  const pairContract = UniswapV2Pair.attach(pairAB);

  await tokenA.transfer(pairAB, amountA);
  await tokenB.transfer(pairAB, amountB);
  await pairContract.mint(owner.address);
  console.log("✅ Liquidity added to pool A-B.");

  // Define token map for easy reference
  const tokenMap = {
    A: tokenA,
    B: tokenB,
    C: tokenC,
    D: tokenD
  };

  // Option 1: Manually define specific pairs (current approach)
  const poolPairs = [
    ['B', 'C'],
    ['C', 'D'],
    ['A', 'D']
  ];

  // Option 2: Generate all possible pairs automatically (uncomment to use)
  // function generateAllPossiblePairs(tokenSymbols) {
  //   const pairs = [];
  //   for (let i = 0; i < tokenSymbols.length; i++) {
  //     for (let j = i + 1; j < tokenSymbols.length; j++) {
  //       // Skip A-B pair since it's created separately for single pool demo
  //       if (!((tokenSymbols[i] === 'A' && tokenSymbols[j] === 'B') || (tokenSymbols[i] === 'B' && tokenSymbols[j] === 'A'))) {
  //         pairs.push([tokenSymbols[i], tokenSymbols[j]]);
  //       }
  //     }
  //   }
  //   return pairs;
  // }
  // const allTokenSymbols = Object.keys(tokenMap);
  // const poolPairs = generateAllPossiblePairs(allTokenSymbols);
  // console.log(`🔄 Generated ${poolPairs.length} possible pairs:`, poolPairs.map(p => p.join('-')).join(', '));

  // Function to create pools and add liquidity
  async function createPoolsAndAddLiquidity(pairs, liquidityAmount) {
    const createdPairs = {};
    const pairContracts = {};

    for (const [token1Symbol, token2Symbol] of pairs) {
      const token1 = tokenMap[token1Symbol];
      const token2 = tokenMap[token2Symbol];

      console.log(`\n🔗 Creating pool for ${token1Symbol} and ${token2Symbol}...`);
      await factory.createPair(token1.address, token2.address);
      const pairAddress = await factory.getPair(token1.address, token2.address);
      console.log(`✅ Pool ${token1Symbol}-${token2Symbol} created at:`, pairAddress);

      createdPairs[`${token1Symbol}${token2Symbol}`] = pairAddress;

      // Add liquidity
      console.log(`\n💰 Adding liquidity to pool ${token1Symbol}-${token2Symbol} (${ethers.utils.formatEther(liquidityAmount)} ${token1Symbol} + ${ethers.utils.formatEther(liquidityAmount)} ${token2Symbol})...`);
      await token1.approve(pairAddress, liquidityAmount);
      await token2.approve(pairAddress, liquidityAmount);

      const pairContract = UniswapV2Pair.attach(pairAddress);
      pairContracts[`${token1Symbol}${token2Symbol}`] = pairContract;

      await token1.transfer(pairAddress, liquidityAmount);
      await token2.transfer(pairAddress, liquidityAmount);
      await pairContract.mint(owner.address);
    }

    return { createdPairs, pairContracts };
  }

  const { createdPairs, pairContracts: poolContracts } = await createPoolsAndAddLiquidity(poolPairs, ethers.utils.parseEther("1000"));

  // Add the A-B pool to the collections
  createdPairs.AB = pairAB;
  poolContracts.AB = pairContract;

  console.log("\n🎉 All pools created and liquidity added!");

  // Function to get amount out for a pair (Uniswap V2 formula)
  function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn.mul(997);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(1000).add(amountInWithFee);
    return numerator.div(denominator);
  }

  // Helper function to log token balances
  async function logBalances(tokens, address, title) {
    console.log(`\n📊 ${title}:`);
    for (const [symbol, token] of Object.entries(tokens)) {
      const balance = await token.balanceOf(address);
      console.log(`   Token${symbol}: ${ethers.utils.formatEther(balance)}`);
    }
  }

  console.log("\n🔄 Step 3: Testing Single Pool Swap");
  console.log("-----------------------------------");

  console.log("\n💱 Swapping 10 TokenA for TokenB in pool A-B...");
  const swapAmount = ethers.utils.parseEther("10");

  await logBalances({A: tokenA, B: tokenB}, owner.address, "Balances before swap");

  await tokenA.approve(createdPairs.AB, swapAmount);
  await tokenA.transfer(createdPairs.AB, swapAmount);

  const reserves = await poolContracts.AB.getReserves();
  const amountOut = getAmountOut(swapAmount, reserves[0], reserves[1]);
  await poolContracts.AB.swap(0, amountOut, owner.address, "0x");

  await logBalances({A: tokenA, B: tokenB}, owner.address, "Balances after swap");

  console.log(`✅ Swap completed! Received ${ethers.utils.formatEther(amountOut)} TokenB`);

  console.log("\n🌐 Step 4: Multi-Hop Swap with Smart Routing");
  console.log("---------------------------------------------");

  // Collect pairs info for routing
  console.log("\n📊 Collecting pool information for routing algorithm...");
  const pairs = [];
  const pairAddresses = Object.values(createdPairs);
  const pairContracts = Object.values(poolContracts);

  for (let i = 0; i < pairAddresses.length; i++) {
    const pairAddr = pairAddresses[i];
    const pairCont = pairContracts[i];
    const [reserve0, reserve1] = await pairCont.getReserves();
    const token0 = await pairCont.token0();
    const token1 = await pairCont.token1();
    pairs.push({
      address: pairAddr,
      token0,
      token1,
      reserve0: ethers.BigNumber.from(reserve0),
      reserve1: ethers.BigNumber.from(reserve1),
      contract: pairCont
    });
  }
  console.log("✅ Pool data collected for routing.");

  // Function to simulate swap in a pair
  function simulateSwap(pair, tokenIn, amountIn) {
    const { token0, reserve0, reserve1 } = pair;
    if (tokenIn === token0) {
      return getAmountOut(amountIn, reserve0, reserve1);
    } else {
      return getAmountOut(amountIn, reserve1, reserve0);
    }
  }

  // Function to find all paths from startToken to endToken with maxHops
  function findAllPaths(startToken, endToken, pairs, maxHops = 3) {
    const paths = [];
    const visited = new Set();

    function dfs(currentToken, path, hops) {
      if (hops > maxHops) return;
      if (currentToken === endToken) {
        paths.push([...path]);
        return;
      }
      visited.add(currentToken);
      for (const pair of pairs) {
        if (pair.token0 === currentToken && !visited.has(pair.token1)) {
          dfs(pair.token1, [...path, pair], hops + 1);
        } else if (pair.token1 === currentToken && !visited.has(pair.token0)) {
          dfs(pair.token0, [...path, pair], hops + 1);
        }
      }
      visited.delete(currentToken);
    }

    dfs(startToken, [], 0);
    return paths;
  }

  // Function to simulate path output
  function simulatePath(path, amountIn, startToken) {
    let currentAmount = amountIn;
    let currentToken = startToken;
    for (const pair of path) {
      const amountOut = simulateSwap(pair, currentToken, currentAmount);
      currentAmount = amountOut;
      currentToken = pair.token0 === currentToken ? pair.token1 : pair.token0;
    }
    return currentAmount;
  }

  console.log("\n🔍 Finding optimal swap path from TokenA to TokenD...");
  const allPaths = findAllPaths(tokenA.address, tokenD.address, pairs, 3);
  console.log(`📋 Found ${allPaths.length} possible path(s):`);
  allPaths.forEach((path, i) => {
    const tokens = [tokenA.address];
    for (const pair of path) {
      tokens.push(pair.token0 === tokens[tokens.length - 1] ? pair.token1 : pair.token0);
    }
    console.log(`   Path ${i + 1}: ${tokens.map(t => t === tokenA.address ? 'A' : t === tokenB.address ? 'B' : t === tokenC.address ? 'C' : 'D').join(' → ')}`);
  });

  console.log("\n⚖️  Simulating swaps to find the best path...");
  let bestPath = null;
  let maxOutput = ethers.BigNumber.from(0);
  const swapAmountMulti = ethers.utils.parseEther("10");

  for (const path of allPaths) {
    const output = simulatePath(path, swapAmountMulti, tokenA.address);
    if (output.gt(maxOutput)) {
      maxOutput = output;
      bestPath = path;
    }
  }

  // Build the token path for display
  const pathTokens = [tokenA.address];
  for (const pair of bestPath) {
    pathTokens.push(pair.token0 === pathTokens[pathTokens.length - 1] ? pair.token1 : pair.token0);
  }
  const pathSymbols = pathTokens.map(t => t === tokenA.address ? 'A' : t === tokenB.address ? 'B' : t === tokenC.address ? 'C' : 'D').join(' → ');

  console.log(`✅ Best path selected: ${pathSymbols}`);
  console.log(`💰 Expected output: ${ethers.utils.formatEther(maxOutput)} TokenD (from 10 TokenA input)`);

  console.log("\n🚀 Step 5: Executing Multi-Hop Swap");
  console.log("-----------------------------------");

  console.log("\n🔄 Performing multi-hop swap from TokenA to TokenD along the best path...");

  await logBalances({A: tokenA, D: tokenD}, owner.address, "Balances before multi-hop swap");

  // Execute the multi-hop swap along the best path
  let currentToken = tokenA.address;
  let currentAmount = swapAmountMulti;

  // Approve and transfer initial amount to the first pair
  await tokenA.approve(bestPath[0].address, swapAmountMulti);
  await tokenA.transfer(bestPath[0].address, swapAmountMulti);

  for (let i = 0; i < bestPath.length; i++) {
    const pair = bestPath[i];
    const amountOut = simulateSwap(pair, currentToken, currentAmount);

    // Determine amount0Out and amount1Out
    let amount0Out = 0;
    let amount1Out = 0;
    if (pair.token0 === currentToken) {
      amount1Out = amountOut;
    } else {
      amount0Out = amountOut;
    }

    // Determine next recipient
    const nextTo = i < bestPath.length - 1 ? bestPath[i + 1].address : owner.address;

    // Execute the swap
    await pair.contract.swap(amount0Out, amount1Out, nextTo, "0x");

    // Log the step
    console.log(`\n🔄 Executed swap on pair ${pair.address}`);
    const fromSymbol = currentToken === tokenA.address ? 'A' : currentToken === tokenB.address ? 'B' : currentToken === tokenC.address ? 'C' : 'D';
    const toSymbol = pair.token0 === currentToken ? (pair.token1 === tokenA.address ? 'A' : pair.token1 === tokenB.address ? 'B' : pair.token1 === tokenC.address ? 'C' : 'D') : (pair.token0 === tokenA.address ? 'A' : pair.token0 === tokenB.address ? 'B' : pair.token0 === tokenC.address ? 'C' : 'D');
    console.log(`   Step ${i + 1}: Swapped ${ethers.utils.formatEther(currentAmount)} ${fromSymbol} → ${ethers.utils.formatEther(amountOut)} ${toSymbol}`);

    // Update for next iteration
    currentToken = pair.token0 === currentToken ? pair.token1 : pair.token0;
    currentAmount = amountOut;
  }

  const finalAmount = currentAmount; // The final output amount

  await logBalances({A: tokenA, D: tokenD}, owner.address, "Balances after multi-hop swap");

  console.log(`\n🎉 Multi-hop swap completed! Received ${ethers.utils.formatEther(finalAmount)} TokenD`);

  console.log("\n✅ Demo completed successfully!");
  console.log("=================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });