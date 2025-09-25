# Uniswap V2 Demo

A comprehensive demonstration of Uniswap V2's automated market maker (AMM) functionality, featuring intelligent 
swap routing and automated pool management.

## 🚀 Overview

This project implements a complete Uniswap V2-like decentralized exchange (DEX) on a local Hardhat network. It demonstrates:

- **Automated Pool Creation**: Dynamically creates liquidity pools for token pairs
- **Smart Routing Algorithm**: Finds optimal swap paths using graph traversal and simulation
- **Multi-Hop Swaps**: Executes complex token swaps across multiple pools
- **Single Pool Swaps**: Demonstrates basic AMM functionality
- **Balance Tracking**: Shows before/after balances for transparency
- **Comprehensive Summary**: Final statistics including fees, volume, and efficiency metrics
- **Clean Code Architecture**: Well-structured, maintainable implementation with helper functions

**Recent Improvements:**
- ✅ Code cleanup: Removed redundancies and optimized structure
- ✅ Helper functions: Added `logBalances()` for consistent balance tracking
- ✅ Single swap demonstration: Clear showcase of basic AMM mechanics
- ✅ Final summary: Comprehensive statistics and final balance overview
- ✅ Enhanced documentation: Updated to reflect all code changes

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Basic understanding of Ethereum and smart contracts

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uniswap_v2_demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

## 🎯 Usage

Run the complete demo:
```bash
npx hardhat run scripts/demo.js
```

**Note**: You do NOT need to run `npx hardhat node` separately. The `npx hardhat run` command automatically starts a temporary local Hardhat network, executes your script, and then stops the network. This is the standard way to run Hardhat scripts.

## 📁 Project Structure

```
uniswap_v2_demo/
├── contracts/              # Smart contracts
│   ├── UniswapV2Factory.sol    # Factory for creating pools
│   ├── UniswapV2Pair.sol       # Pool contract (AMM logic)
│   ├── UniswapV2ERC20.sol      # ERC20 token implementation
│   ├── MyToken.sol             # Test ERC20 token
│   ├── interfaces/             # Contract interfaces
│   └── libraries/              # Math libraries
├── scripts/
│   └── demo.js                 # Main demonstration script
├── test/                       # Test files
├── artifacts/                  # Compiled contracts
├── cache/                      # Hardhat cache
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔍 Fundamentals

### Automated Market Maker (AMM)

Unlike traditional order-book exchanges, AMMs use mathematical formulas to price assets. Uniswap V2 uses the **constant product formula**:

```
x * y = k
```

Where:
- `x` = amount of token X in the pool
- `y` = amount of token Y in the pool
- `k` = constant product

### Liquidity Pools

- **Creation**: Two tokens are paired to create a pool
- **Liquidity**: Users add equal value of both tokens
- **Trading**: Swaps maintain the constant product `k`
- **Fees**: 0.3% fee on swaps, added to pool reserves

### Swap Mechanics

**Single Pool Swap:**
```
Input Amount → Pool → Output Amount
```

**Multi-Hop Swap:**
```
Input → Pool A → Intermediate → Pool B → Output
```

### Routing Algorithm

The demo implements a sophisticated routing system:

1. **Graph Construction**: Models pools as nodes, connections as edges
2. **Path Finding**: Uses DFS to discover all possible routes
3. **Simulation**: Calculates output amounts for each path
4. **Optimization**: Selects path with maximum output
5. **Execution**: Performs swaps along the optimal route

## ⚙️ How It Works

### Step 1: Contract Deployment
- Deploys Uniswap V2 Factory contract
- Creates test ERC20 tokens (A, B, C, D)
- Each token has 1,000,000 initial supply

### Step 2: Pool Setup
- **Manual Configuration**: Define specific pool pairs (default: A-B, B-C, C-D, A-D)
- **Automatic Generation**: Create all possible pairs from available tokens
- Adds 1000 tokens of each pair to liquidity

### Step 3: Single Pool Demonstration
- Shows basic swap: 10 TokenA → TokenB
- Displays balance changes
- Demonstrates constant product formula

### Step 4: Multi-Hop Routing
- Collects all pool information
- Finds all possible paths from source to destination
- Simulates each path to calculate output
- Selects optimal path (maximum output)

### Step 5: Multi-Hop Execution
- Executes swaps along the chosen path
- Handles token transfers between pools
- Shows step-by-step balance changes

### Step 6: Final Summary
- Displays final balances for all tokens
- Calculates and shows comprehensive statistics
- Summarizes total volume, fees, and routing efficiency

## 🎨 Key Features

### Automated Pool Management
**Manual Approach** (Default):
```javascript
const poolPairs = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
  ['A', 'D']
];
```
Easily configure pool topology by modifying the array.

**Automatic Approach** (Optional):
```javascript
const allPairs = generateAllPossiblePairs(tokens);
// Creates all combinations: A-B, A-C, A-D, B-C, B-D, C-D
```
Scalable for any number of tokens without manual configuration.

### Intelligent Routing
- **Path Discovery**: Finds all viable routes
- **Cost Simulation**: Calculates exact output for each path
- **Optimal Selection**: Chooses highest-yield route
- **Dynamic Execution**: Adapts to any pool configuration

### Educational Transparency
- **Balance Tracking**: Shows balances before/after each operation with helper function
- **Step-by-Step Logging**: Clear progression through each phase
- **Formula Demonstration**: Illustrates AMM mathematics with clean, readable code
- **Code Quality**: Optimized implementation with helper functions and no redundancies

## � Pool Configuration Options

### Manual vs Automatic Pair Generation

**When to Use Manual Configuration:**
- Educational demonstrations with specific pool topologies
- Small token sets where you want precise control
- Understanding specific routing scenarios
- Default approach for learning Uniswap mechanics

**When to Use Automatic Generation:**
- Large token ecosystems with many possible pairs
- Scalable applications requiring all combinations
- Testing comprehensive routing algorithms
- Real-world DEX simulations

**How to Switch Approaches:**
1. **Manual** (default): Keep `poolPairs` array as-is
2. **Automatic**: Uncomment `generateAllPossiblePairs` call in `demo.js`

Both approaches work seamlessly with the routing algorithm - the system automatically discovers optimal paths regardless of pool configuration.

## �🔧 Technical Implementation

### Smart Contracts
- **UniswapV2Factory**: Creates and tracks pools
- **UniswapV2Pair**: Implements AMM logic and swaps
- **ERC20 Tokens**: Standard token implementation

### Routing Algorithm
```javascript
// Core functions for swap calculations and routing
function getAmountOut(amountIn, reserveIn, reserveOut) // Uniswap V2 formula with 0.3% fee
function logBalances(tokens, address, title) // Helper for balance tracking

// Find all paths using DFS
function findAllPaths(startToken, endToken, pairs, maxHops)

// Simulate path output
function simulatePath(path, amountIn, startToken)

// Select optimal path
const bestPath = paths.reduce((best, current) => {
  const output = simulatePath(current, amountIn, startToken);
  return output > best.output ? {path: current, output} : best;
});
```

### Swap Execution
- **Token Approval**: Approves pool contracts for token transfers
- **Sequential Swaps**: Transfers tokens through intermediate pools
- **Fee Calculation**: Applies 0.3% Uniswap V2 fee structure

## 📊 Example Output

```
🚀 Starting Uniswap V2 Demo
============================

📦 Step 1: Deploying Uniswap V2 Contracts
✅ Factory deployed at: 0x...
✅ TokenA deployed at: 0x...

🔄 Step 3: Testing Single Pool Swap
💱 Swapping 10 TokenA for TokenB in pool A-B...

```
📊 Balances before swap:
   TokenA: 1,000,000,000,000,000,000
   TokenB: 1,000,000,000,000,000,000

📊 Balances after swap:
   TokenA: 999,999,999,999,999,999.871580343970612988
   TokenB: 1,000,000,000,000,000,000
✅ Swap completed! Received 9.871580343970612988 TokenB

🌐 Step 4: Multi-Hop Swap with Smart Routing
🔍 Finding optimal swap path from TokenA to TokenD...
📋 Found 2 possible path(s):
   Path 1: A → D
   Path 2: A → B → C → D

⚖️ Simulating swaps to find the best path...
✅ Best path selected: A → D
💰 Expected output: 9.871580343970612988 TokenD

🎉 Multi-hop swap completed! Received 9.871580343970612988 TokenD

📊 Step 6: Final Summary
📊 Final balances for all tokens:
   TokenA: 999,999,999,999,999,989.871580343970612988
   TokenB: 1,000,000,000,000,000,000
   TokenC: 1,000,000,000,000,000,000
   TokenD: 1,000,000,000,000,000,009.871580343970612988

📈 Demo Statistics:
   💰 TokenA spent: 20.0 (10 in single swap + 10 in multi-hop)
   💰 TokenD received: 9.871580343970612988 (from multi-hop swap)
   💰 TokenB received: 9.871580343970612988 (from single swap)
   💸 Total fees paid: 0.06 (0.3% per swap)
   🛣️ Routing efficiency: 2 swaps from 2 possible paths
   🏊 Pools utilized: 4 liquidity pools
   📊 Net swap result: 20 A input → 19.743160687941225976 tokens output
   📊 Total swap volume: 20 tokens
   ✅ All operations successful
```
```

## 🎓 Learning Objectives

This demo helps understand:
- How decentralized exchanges work
- Automated market maker mathematics
- Multi-hop swap optimization
- Smart contract interaction patterns
- DeFi protocol mechanics
- Clean code architecture and helper functions
- Balance tracking and transparency in DeFi
- Performance metrics and trading statistics

## 🤝 Contributing

Feel free to:
- Add more token pairs to the routing network
- Implement additional DEX features
- Improve the routing algorithm
- Add more comprehensive tests
- Enhance code quality and add more helper functions
- Optimize gas usage and performance

## 📄 License

This project is for educational purposes. See individual contract licenses for details.

## 🔗 Resources

- [Uniswap V2 Documentation](https://docs.uniswap.org/)
- [Automated Market Makers](https://defipulse.com/blog/automated-market-makers/)
- [Constant Product Formula](https://www.investopedia.com/terms/c/constant-product-market-maker.asp)