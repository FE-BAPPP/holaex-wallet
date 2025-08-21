import TronWeb from 'tronweb';
import { WalletTransaction, ScannerState, ChildWalletPool, User } from '../../models';
import Redis from 'ioredis';
import TronService from '../tron/TronService'; 
import dotenv from 'dotenv';

dotenv.config();

export class DepositScanner {
  private tronWeb: TronWeb;
  private tronService: TronService; 
  private redis: Redis;
  private isRunning: boolean = false;
  private scannerName = 'deposit-scanner';
  private readonly usdtContract: string;
  private readonly requiredConfirmations: number;
  private walletAddressCache: Set<string> = new Set(); // Sẽ lưu Base58 format

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE || 'https://nile.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY || '' }
    });
    
    this.tronService = new TronService();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Log all environment variables
    console.log(` DEBUG - Environment variables:`);
    console.log(`   TRON_FULL_NODE: ${process.env.TRON_FULL_NODE}`);
    console.log(`   USDT_CONTRACT_ADDRESS: ${process.env.USDT_CONTRACT_ADDRESS}`);
    
    // Check env first, then auto-detect
    if (process.env.USDT_CONTRACT_ADDRESS) {
      this.usdtContract = process.env.USDT_CONTRACT_ADDRESS;
      console.log(` Using USDT contract from ENV: ${this.usdtContract}`);
    } else {
      const fullNode = process.env.TRON_FULL_NODE || 'https://nile.trongrid.io';
      console.log(` Auto-detecting network from: ${fullNode}`);

      if (fullNode.includes('nileex') || fullNode.includes('nile')) {
        this.usdtContract = 'TXYZopYRdj2D9XRtbG411XZZ3kMAeBf';
        console.log(` Detected TESTNET - using: ${this.usdtContract}`);
      } else {
        this.usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
        console.log(` Detected MAINNET - using: ${this.usdtContract}`);
      }
    }
    
    this.requiredConfirmations = parseInt(process.env.REQUIRED_CONFIRMATIONS || '3');

    console.log(`\n DepositScanner FINAL CONFIG:`);
    console.log(`    Network: ${process.env.TRON_FULL_NODE}`);
    console.log(`    USDT Contract: ${this.usdtContract}`);
    console.log(`    Required Confirmations: ${this.requiredConfirmations}\n`);
    
    this.loadWalletAddressCache();
  }

  /* 
    Normalize address to Base58 format (Txxx)
    Handles both hex (41xxx, 0x41xxx) and Base58 (Txxx) formats
   */
  private normalizeAddress(addr: string): string {
    if (!addr) return '';
    
    try {
      // already Base58 format (starts with T), return as-is
      if (addr.startsWith('T') && addr.length === 34) {
        return addr;
      }
      
      // hex format (41xxx or 0x41xxx), convert to Base58
      if (addr.startsWith('41') || addr.startsWith('0x41')) {
        return this.tronWeb.address.fromHex(addr);
      }
      
      // convert hex to Base58
      return this.tronWeb.address.fromHex(addr);
    } catch (error) {
      console.warn(`Failed to normalize address: ${addr}`, error);
      return addr;
    }
  }

  /**
   * Load all assigned wallet addresses into cache (Base58 format)
   */
  private async loadWalletAddressCache(): Promise<void> {
    try {
      const wallets = await ChildWalletPool.find({ status: 'ASSIGNED' }).select('wallet_address');
      
      // Clear existing cache
      await this.redis.del('wallet_addresses');
      this.walletAddressCache.clear();
      
      // Load into Redis and memory cache
      if (wallets.length > 0) {
        const base58Addresses = wallets.map(w => this.normalizeAddress(w.wallet_address));
        await this.redis.sadd('wallet_addresses', ...base58Addresses);
        base58Addresses.forEach(addr => this.walletAddressCache.add(addr));
        
        console.log(` Loaded ${wallets.length} wallet addresses to cache (Base58 format)`);
        console.log(` Sample addresses:`, base58Addresses.slice(0, 3));
      } else {
        console.log(` No assigned wallets found in database`);
      }
      
    } catch (error) {
      console.error(' Error loading wallet cache:', error);
    }
  }

  /**
   * Check if address is in our wallet pool (normalize to Base58 before comparing)
   */
  private async isOurWallet(address: string): Promise<boolean> {
    try {
      const normalizedAddr = this.normalizeAddress(address);
      
      // Check memory cache first
      if (this.walletAddressCache.has(normalizedAddr)) {
        return true;
      }
      
      // Check Redis cache
      const exists = await this.redis.sismember('wallet_addresses', normalizedAddr);
      if (exists) {
        this.walletAddressCache.add(normalizedAddr); // Update memory cache
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(' Error checking wallet:', error);
      return false;
    }
  }

    /* 
    Get current scanner state
    */
  private async getScannerState(): Promise<any> {
    try {
      let scannerState = await ScannerState.findOne({ scanner_name: this.scannerName });
      
      if (!scannerState) {
        // Get latest block from Tron network and start from a recent block
        const latestBlock = await this.tronWeb.trx.getCurrentBlock();
        const startBlock = latestBlock.block_header.raw_data.number - 100; //block hiện tại – 100 

        scannerState = new ScannerState({
          scanner_name: this.scannerName,
          last_processed_block: startBlock,
          is_running: false
        });
        await scannerState.save();
        
        console.log(`Created new scanner state, starting from block: ${startBlock}`);
      }
      
      return scannerState;
    } catch (error) {
      console.error(' Error getting scanner state:', error);
      throw error;
    }
  }


   /* Scan USDT transfers in block  */
  private async scanBlocks(fromBlock: number, toBlock: number): Promise<void> {
    try {
      console.log(`\n Scanning blocks ${fromBlock} to ${toBlock} for USDT transfers`);
      console.log(` USDT Contract: ${this.usdtContract}`);
      console.log(` Watching ${this.walletAddressCache.size} wallet addresses`);
      
      // Use TronService to get transfer events
      const transferEvents = await this.tronService.getTRC20TransferEvents(
        this.usdtContract,
        fromBlock,
        toBlock
      );

      console.log(` Raw transfer events found: ${transferEvents.length}`);
      
      if (transferEvents.length === 0) {
        console.log(` No USDT transfer events found in blocks ${fromBlock}-${toBlock}`);
        return;
      }

      console.log(` Processing ${transferEvents.length} transfer events`);
      
      // Filter events to our wallets first
      let matchedEvents = 0;
      
      for (const event of transferEvents) {
        try {
          const processed = await this.processTransferEvent(event);
          if (processed) matchedEvents++;
        } catch (error) {
          console.error(` Error processing event:`, error);
        }
      }
      
      console.log(` Processed ${matchedEvents} events matching our wallets\n`);
      
    } catch (error) {
      console.error(' Error scanning blocks:', error);
      throw error;
    }
  }

  /**
   * Process single transfer event (FIXED VERSION with normalize)
   */
  private async processTransferEvent(event: any): Promise<boolean> {
    try {
      const { transaction_id, block_number, event_index, result } = event;
      
      if (!result || !result.to || !result.value) {
        console.log(` Invalid transfer event - missing result data`);
        return false;
      }
      
      const { from, to, value } = result;
      
      // Normalize addresses to Base58 format for comparison
      const toBase58 = this.normalizeAddress(to);
      const fromBase58 = this.normalizeAddress(from);

      console.log(` Transfer: from=${fromBase58} → to=${toBase58}, value=${value}`);

      // Check if it's our wallet (both normalized to Base58)
      const isOurWallet = await this.isOurWallet(toBase58);
      
      if (!isOurWallet) {
        return false; // Not our wallet, skip silently
      }

      console.log(`\n DEPOSIT DETECTED!`);
      console.log(`    From: ${fromBase58}`);
      console.log(`    To (Our Wallet): ${toBase58}`);
      console.log(`    Value: ${value}`);
      console.log(`    TX: ${transaction_id}`);

      // Find user by wallet address
      const wallet = await ChildWalletPool.findOne({ 
        wallet_address: toBase58, 
        status: 'ASSIGNED' 
      }).populate('user_id');
      
      if (!wallet || !wallet.user_id) {
        console.error(` No user found for wallet ${toBase58}`);
        return false;
      }

      console.log(` Found user: ${wallet.user_id} for wallet: ${toBase58}`);

      // Check if transaction already exists (idempotent)
      const existingTx = await WalletTransaction.findOne({
        tx_hash: transaction_id,
        log_index: event_index || 0,
        direction: 'IN'
      });

      if (existingTx) {
        console.log(` Transaction already processed: ${transaction_id}`);
        return false;
      }

      // Convert amount from hex/string to number (USDT has 6 decimals)
      let amountInUsdt: number;
      try {
        // Handle both hex and decimal formats
        const rawValue = value.toString().startsWith('0x') 
          ? parseInt(value, 16) 
          : parseInt(value.toString());
        amountInUsdt = rawValue / 1e6;
        console.log(` Amount calculation: raw=${value} → ${rawValue} → ${amountInUsdt} USDT`);
      } catch (error) {
        console.error(' Error converting amount:', value, error);
        return false;
      }

      // Create new wallet transaction
      const walletTx = new WalletTransaction({
        tx_hash: transaction_id,
        log_index: event_index || 0,
        user_id: wallet.user_id,
        wallet_address: toBase58,
        direction: 'IN',
        amount: amountInUsdt,
        block_height: block_number,
        confirmations: 0,
        status: 'PENDING',
        contract_address: this.usdtContract,
        created_at: new Date()
      });

      await walletTx.save();
      
      console.log(` NEW DEPOSIT SAVED!`);
      console.log(`    Amount: ${amountInUsdt} USDT`);
      console.log(`    User: ${wallet.user_id}`);
      console.log(`    Wallet: ${toBase58}`);
      console.log(`    DB ID: ${walletTx._id}\n`);

      return true;

    } catch (error) {
      console.error(' Error processing transfer event:', error);
      return false;
    }
  }

  /**
   * Update confirmations for pending transactions
   */
  private async updateConfirmations(): Promise<void> {
    try {
      const currentBlock = await this.tronWeb.trx.getCurrentBlock();
      const currentBlockNumber = currentBlock.block_header.raw_data.number;
      
      const pendingTxs = await WalletTransaction.find({
        status: 'PENDING',
        direction: 'IN'
      });

      if (pendingTxs.length > 0) {
        console.log(` Updating confirmations for ${pendingTxs.length} pending transactions`);
      }

      for (const tx of pendingTxs) {
        const confirmations = currentBlockNumber - tx.block_height;
        
        const updateData: any = { confirmations };
        
        if (confirmations >= this.requiredConfirmations && tx.status === 'PENDING') {
          updateData.status = 'CONFIRMED';
          updateData.confirmed_at = new Date();
          
          console.log(` Deposit CONFIRMED: ${tx.amount} USDT for user ${tx.user_id} (${confirmations} confirmations)`);
          
          // Publish to Redis for sweep service
          await this.redis.publish('deposit-confirmed', JSON.stringify({
            transaction_id: tx._id,
            user_id: tx.user_id,
            amount: tx.amount,
            wallet_address: tx.wallet_address
          }));
        }
        
        await WalletTransaction.findByIdAndUpdate(tx._id, updateData);
      }
      
    } catch (error) {
      console.error(' Error updating confirmations:', error);
    }
  }

  /**
   * Main scanning loop
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log(' Scanner already running');
      return;
    }

    this.isRunning = true;
    console.log(' Starting deposit scanner...');

    try {
      await ScannerState.findOneAndUpdate(
        { scanner_name: this.scannerName },
        { 
          is_running: true, 
          last_scan_time: new Date(),
          error_count: 0 
        },
        { upsert: true }
      );

      while (this.isRunning) {
        try {
          const scannerState = await this.getScannerState();
          const currentBlock = await this.tronWeb.trx.getCurrentBlock();
          const currentBlockNumber = currentBlock.block_header.raw_data.number;
          
          const fromBlock = scannerState.last_processed_block + 1;
          const toBlock = Math.min(fromBlock + 10, currentBlockNumber); // Process max 10 blocks at once
          
          if (fromBlock <= toBlock) {
            console.log(` Current block: ${currentBlockNumber}, scanning: ${fromBlock}-${toBlock}`);
            await this.scanBlocks(fromBlock, toBlock);
            
            // Update scanner state
            await ScannerState.findOneAndUpdate(
              { scanner_name: this.scannerName },
              { 
                last_processed_block: toBlock,
                last_scan_time: new Date(),
                error_count: 0,
                last_error: null
              }
            );
          } else {
            console.log(' Waiting for new blocks...');
          }

          // Update confirmations for pending transactions
          await this.updateConfirmations();

          // Reload wallet cache every 5 minutes
          const now = Date.now();
          if (now % (5 * 60 * 1000) < 30000) {
            await this.loadWalletAddressCache();
          }

          // Wait before next scan
          const scanInterval = parseInt(process.env.SCANNER_INTERVAL || '30000');
          await new Promise(resolve => setTimeout(resolve, scanInterval));
          
        } catch (error) {
          console.error(' Scanner iteration error:', error);
          
          await ScannerState.findOneAndUpdate(
            { scanner_name: this.scannerName },
            { 
              $inc: { error_count: 1 },
              last_error: error,
              last_error_time: new Date()
            }
          );
          
          // Wait longer on error
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    } finally {
      this.isRunning = false;
      await ScannerState.findOneAndUpdate(
        { scanner_name: this.scannerName },
        { is_running: false }
      );
      console.log(' Deposit scanner stopped');
    }
  }

  /**
   * Stop scanner
   */
  async stop(): Promise<void> {
    console.log(' Stopping deposit scanner...');
    this.isRunning = false;
  }

  /**
   * Get scanner status
   */
  async getStatus(): Promise<any> {
    const scannerState = await ScannerState.findOne({ scanner_name: this.scannerName });
    const currentBlock = await this.tronWeb.trx.getCurrentBlock();
    
    return {
      scanner_name: this.scannerName,
      is_running: this.isRunning,
      current_block: currentBlock.block_header.raw_data.number,
      last_processed_block: scannerState?.last_processed_block || 0,
      blocks_behind: currentBlock.block_header.raw_data.number - (scannerState?.last_processed_block || 0),
      last_scan_time: scannerState?.last_scan_time,
      error_count: scannerState?.error_count || 0,
      last_error: scannerState?.last_error,
      cached_wallets: this.walletAddressCache.size
    };
  }
}

export default new DepositScanner();