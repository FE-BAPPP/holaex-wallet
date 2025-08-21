import fs from 'fs';
import path from 'path';
import WalletGenerator from '../../utils/WalletGenerator';
import { ChildWalletPool } from '../../models';
import mongoose from 'mongoose';
import TronWeb from 'tronweb';

export class SetupService {
  
  async initializeMasterWallet(): Promise<void> {
    console.log('Generating master wallet...');
    
    const setupPath = path.join(process.cwd(), 'setup.json');
    if (fs.existsSync(setupPath)) {
      throw new Error('Master wallet already initialized. Delete setup.json (or run reset) before creating a new one.');
    }

    const masterWallet = WalletGenerator.generateMasterWallet();

    console.log('Master wallet generated:');
    console.log(`Address: ${masterWallet.address}`);
    console.log(`Mnemonic: ${masterWallet.mnemonic}`);
    console.log(`Encryption Key: ${masterWallet.encryptionKey}`);
    
    const jwtSecret = WalletGenerator.generateJWTSecret();
    
    await this.updateEnvFile({
      MASTER_WALLET_MNEMONIC: masterWallet.encryptedMnemonic,
      MASTER_WALLET_ADDRESS: masterWallet.address,
      ENCRYPTION_KEY: masterWallet.encryptionKey,
      JWT_SECRET: jwtSecret
    });
    
    console.log('Environment file updated');
    
    const setupInfo = {
      masterWallet: {
        address: masterWallet.address,
        mnemonic: masterWallet.mnemonic,
        encryptedMnemonic: masterWallet.encryptedMnemonic,
        encryptionKey: masterWallet.encryptionKey
      },
      jwtSecret,
      createdAt: new Date().toISOString(),
      warning: "DELETE THIS FILE IN PRODUCTION! Contains sensitive information."
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'setup.json'), 
      JSON.stringify(setupInfo, null, 2)
    );
    
    console.log('Setup info saved to setup.json (DELETE IN PRODUCTION!)');
  }

  async generateInitialWalletPool(count: number = 1000): Promise<void> {
    console.log(`Generating ${count} child wallets...`);
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const existingCount = await ChildWalletPool.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing wallets. Skipping generation.`);
      return;
    }
    
    const setupPath = path.join(process.cwd(), 'setup.json');
    if (!fs.existsSync(setupPath)) {
      throw new Error('Setup file not found. Run initializeMasterWallet first.');
    }
    
    const setupInfo = JSON.parse(fs.readFileSync(setupPath, 'utf8'));
    const masterMnemonic = setupInfo.masterWallet.mnemonic;
    
    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const startIndex = batch * batchSize;
      const currentBatchSize = Math.min(batchSize, count - startIndex);
      
      console.log(`Generating batch ${batch + 1}/${batches} (${currentBatchSize} wallets)...`);
      
      const childWallets = WalletGenerator.batchGenerateChildWallets(
        masterMnemonic,
        startIndex,
        currentBatchSize
      );
      
      const walletDocs = childWallets.map(wallet => ({
        derivation_index: wallet.derivationIndex,
        wallet_address: wallet.address,
        status: 'FREE'
      }));
      
      await ChildWalletPool.insertMany(walletDocs);
      
      console.log(`Batch ${batch + 1} completed`);
    }
    
    console.log(`Successfully generated ${count} child wallets!`);
  }

  async testTronConnectivity(): Promise<void> {
    console.log('Testing Tron network connectivity...');
    
    try {
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_NODE || 'https://api.nileex.io',
        headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY }
      });
      
      const currentBlock = await tronWeb.trx.getCurrentBlock();
      if (!currentBlock || !currentBlock.block_header) {
        throw new Error('Could not fetch block data from Tron node');
      }

      console.log(`Connected to Tron ${process.env.TRON_NETWORK || 'testnet'}`);
      console.log(`Current block: ${currentBlock.block_header.raw_data.number}`);
      
      // Optional USDT check
      if (process.env.USDT_CONTRACT_ADDRESS) {
        try {
          const contract = await tronWeb.contract().at(process.env.USDT_CONTRACT_ADDRESS);
          const symbol = await contract.symbol().call();
          const decimals = await contract.decimals().call();
          console.log(`USDT Contract connected: ${symbol} (${decimals} decimals)`);
        } catch (contractErr: any) {
          console.warn('USDT contract test skipped/failed:', contractErr.message || contractErr);
        }
      } else {
        console.log('Skipping USDT contract test (no USDT_CONTRACT_ADDRESS in .env)');
      }
    } catch (error: any) {
      console.error('Tron connectivity test failed:', error?.message || error);
      throw new Error('Tron connectivity failed: ' + (error?.message || JSON.stringify(error)));
    }
  }

  async checkMasterWalletBalance(): Promise<void> {
    console.log('Checking master wallet balance...');
    
    const setupPath = path.join(process.cwd(), 'setup.json');
    if (!fs.existsSync(setupPath)) {
      throw new Error('Setup file not found. Run initializeMasterWallet first.');
    }
    
    const setupInfo = JSON.parse(fs.readFileSync(setupPath, 'utf8'));
    const masterAddress = setupInfo.masterWallet.address;
    
    const addressInfo = await WalletGenerator.getAddressInfo(masterAddress);
    
    console.log(`Master wallet: ${masterAddress}`);
    console.log(`TRX Balance: ${addressInfo.balance} TRX`);
    
    if (addressInfo.balance === 0) {
      console.log('Master wallet has 0 TRX. Please fund it before testing.');
      console.log('Get testnet TRX: https://nileex.io/join/getJoinPage');
    }
  }

  private async updateEnvFile(updates: Record<string, string>): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
  }

  async setupComplete(): Promise<void> {
    console.log('Starting HollaEx Wallet setup...\n');
    
    //Check nếu setup.json đã tồn tại thì dừng luôn
    const setupPath = path.join(process.cwd(), 'setup.json');
    if (fs.existsSync(setupPath)) {
      throw new Error('Setup already completed. Delete setup.json and reset MongoDB before running setup again.');
    }

    try {
      await this.testTronConnectivity();
      console.log('');
      
      await this.initializeMasterWallet();
      console.log('');
      
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }
      await this.generateInitialWalletPool(1000);
      console.log('');
      
      await this.checkMasterWalletBalance();
      console.log('');
      
      console.log('Setup completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Fund your master wallet with testnet TRX');
      console.log('2. Update TRON_GRID_API_KEY in .env with real API key');
      console.log('3. Test user registration and wallet assignment');
      console.log('4. DELETE setup.json file in production!');
      
    } catch (error: any) {
      console.error('Setup failed:', error?.message || error);
      throw error;
    }
  }
}

export default new SetupService();
