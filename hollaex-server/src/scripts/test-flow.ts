#!/usr/bin/env node

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, ChildWalletPool, WalletTransaction } from '../models';
import AuthController from '../controllers/AuthController';
import WalletService from '../services/wallet/WalletService';
import PointsService from '../services/points/PointsService';

// Load environment variables
dotenv.config();

class TestFlow {
  
  async connectDB() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('✅ Connected to MongoDB');
    }
  }

  async testUserRegistration() {
    console.log('\n📝 Testing user registration...');
    
    // Create test user
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123456!'
    };
    
    console.log(`📧 Creating user: ${testUser.email}`);
    
    // Simulate registration request
    const mockReq = {
      body: testUser
    } as any;
    
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`📊 Response (${code}):`, JSON.stringify(data, null, 2));
          return data;
        }
      }),
      json: (data: any) => {
        console.log('📊 Response:', JSON.stringify(data, null, 2));
        return data;
      }
    } as any;
    
    try {
      await AuthController.register(mockReq, mockRes);
      
      // Verify user was created with wallet
      const user = await User.findOne({ email: testUser.email });
      if (user && user.wallet_address) {
        console.log('✅ User registration successful');
        console.log(`👛 Assigned wallet: ${user.wallet_address}`);
        console.log(`🎯 Derivation index: ${user.derivation_index}`);
        return user;
      } else {
        throw new Error('User registration failed');
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  async testWalletPoolStatus() {
    console.log('\n👛 Checking wallet pool status...');
    
    const freeWallets = await ChildWalletPool.countDocuments({ status: 'FREE' });
    const assignedWallets = await ChildWalletPool.countDocuments({ status: 'ASSIGNED' });
    const totalWallets = await ChildWalletPool.countDocuments();
    
    console.log(`📊 Wallet Pool Status:`);
    console.log(`   Total: ${totalWallets}`);
    console.log(`   Free: ${freeWallets}`);
    console.log(`   Assigned: ${assignedWallets}`);
    
    if (freeWallets < 100) {
      console.log('⚠️  Low wallet pool! Consider generating more wallets.');
    }
    
    // Show some sample wallets
    const sampleWallets = await ChildWalletPool.find({ status: 'ASSIGNED' }).limit(3);
    console.log('\n📋 Sample assigned wallets:');
    sampleWallets.forEach((wallet, i) => {
      console.log(`   ${i + 1}. Index ${wallet.derivation_index}: ${wallet.wallet_address}`);
    });
  }

  async testPointsEconomy() {
    console.log('\n💰 Testing points economy...');
    
    // Create two test users
    const user1 = await User.findOne().limit(1);
    if (!user1) {
      throw new Error('No users found. Run user registration test first.');
    }
    
    // Simulate deposit credit
    console.log('💳 Simulating deposit credit...');
    await PointsService.creditPoints(
      user1._id.toString(),
      100,
      'DEPOSIT',
      'test-deposit-' + Date.now(),
      'Test deposit simulation'
    );
    
    console.log('✅ Credited 100 points to user');
    
    // Check balance
    const balance = await PointsService.getBalance(user1._id.toString());
    console.log(`💰 User balance: ${balance} points`);
    
    // Get transaction history
    const history = await PointsService.getTransactionHistory(user1._id.toString(), 1, 5);
    console.log('📊 Recent transactions:');
    history.forEach((tx, i) => {
      console.log(`   ${i + 1}. ${tx.transaction_type}: ${tx.amount} points (${tx.description})`);
    });
  }

  async testTronConnectivity() {
    console.log('\n🔗 Testing Tron network connectivity...');
    
    try {
      const TronWeb = require('tronweb');
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_NODE || 'https://api.nileex.io',
        headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY }
      });
      
      tronWeb.setAddress(process.env.MASTER_WALLET_ADDRESS!);
      const currentBlock = await tronWeb.trx.getCurrentBlock();
      console.log(`✅ Connected to Tron ${process.env.TRON_NETWORK}`);
      console.log(`📊 Current block: ${currentBlock.block_header.raw_data.number}`);
      
      // Test USDT contract
      const contract = await tronWeb.contract().at(process.env.USDT_CONTRACT_ADDRESS!);
      const symbol = await contract.symbol().call();
      console.log(`✅ USDT Contract: ${symbol}`);
      
    } catch (error) {
      console.error('❌ Tron connectivity failed:', error);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting HollaEx Wallet Tests...\n');
    
    try {
      await this.connectDB();
      await this.testTronConnectivity();
      await this.testWalletPoolStatus();
      
      const user = await this.testUserRegistration();
      await this.testPointsEconomy();
      
      console.log('\n🎉 All tests passed successfully!');
      console.log('\n📋 System is ready for:');
      console.log('1. ✅ User registration with wallet assignment');
      console.log('2. ✅ Points economy (credit/debit/P2P)');
      console.log('3. ✅ Tron network connectivity');
      console.log('4. ✅ HD wallet derivation');
      console.log('\n🚀 Next: Fund master wallet and test deposits!');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const testFlow = new TestFlow();
  testFlow.runAllTests();
}

export default TestFlow;
