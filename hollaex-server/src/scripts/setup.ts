#!/usr/bin/env node

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SetupService from '../services/setup/SetupService';

// Load environment variables
dotenv.config();

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'init':
        console.log('🏗️  Initializing HollaEx Wallet System...\n');
        await SetupService.setupComplete();
        break;
        
      case 'generate-master':
        console.log('🔑 Generating master wallet...\n');
        await SetupService.initializeMasterWallet();
        break;
        
      case 'generate-wallets':
        const count = parseInt(process.argv[3]) || 1000;
        console.log(`👛 Generating ${count} child wallets...\n`);
        await mongoose.connect(process.env.MONGODB_URI!);
        await SetupService.generateInitialWalletPool(count);
        break;
        
      case 'test-tron':
        console.log('🔍 Testing Tron connectivity...\n');
        await SetupService.testTronConnectivity();
        break;
        
      case 'check-balance':
        console.log('💰 Checking master wallet balance...\n');
        await SetupService.checkMasterWalletBalance();
        break;
        
      default:
        console.log('HollaEx Wallet Setup CLI\n');
        console.log('Usage:');
        console.log('  npm run setup init                    - Complete setup process');
        console.log('  npm run setup generate-master         - Generate master wallet only');
        console.log('  npm run setup generate-wallets [num]  - Generate child wallets');
        console.log('  npm run setup test-tron               - Test Tron connectivity');
        console.log('  npm run setup check-balance           - Check master wallet balance');
        console.log('');
        console.log('Examples:');
        console.log('  npm run setup init');
        console.log('  npm run setup generate-wallets 500');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

main();
