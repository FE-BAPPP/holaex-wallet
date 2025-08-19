import TronWeb from 'tronweb';
import { WalletTransaction, ScannerState, ChildWalletPool, User } from '../models';
import Redis from 'ioredis';

export class DepositScanner {
  private tronWeb: TronWeb;
  private redis: Redis;
  private isRunning: boolean = false;
  private scannerName = 'deposit-scanner';
  private readonly usdtContract: string;
  private readonly requiredConfirmations: number;
  private walletAddressCache: Set<string> = new Set();

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE || 'https://api.nileex.io',
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY }
    });
    
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.usdtContract = process.env.USDT_CONTRACT_ADDRESS!;
    this.requiredConfirmations = parseInt(process.env.REQUIRED_CONFIRMATIONS || '3');
    
    this.loadWalletAddressCache();
  }

  /**
   * Load all assigned wallet addresses into Redis cache
   */
  private async loadWalletAddressCache(): Promise<void> {
    try {
      const wallets = await ChildWalletPool.find({ status: 'ASSIGNED' }).select('wallet_address');
      
      // Clear existing cache
      await this.redis.del('wallet_addresses');
      this.walletAddressCache.clear();
      
      // Load into Redis and memory
      if (wallets.length > 0) {
        const addresses = wallets.map(w => w.wallet_address);
        await this.redis.sadd('wallet_addresses', ...addresses);
        addresses.forEach(addr => this.walletAddressCache.add(addr));
      }
      
      console.log(`Loaded ${wallets.length} wallet addresses to cache`);
    } catch (error) {
      console.error('Error loading wallet cache:', error);
    }
  }

  /**
   * Check if address is in our wallet pool
   */
  private async isOurWallet(address: string): Promise<boolean> {
    // First check memory cache
    if (this.walletAddressCache.has(address)) {
      return true;
    }
    
    // Check Redis cache
    const exists = await this.redis.sismember('wallet_addresses', address);
    if (exists) {
      this.walletAddressCache.add(address); // Update memory cache
      return true;
    }
    
    return false;
  }

  /**
   * Get current scanner state
   */
  private async getScannerState(): Promise<any> {
    let scannerState = await ScannerState.findOne({ scanner_name: this.scannerName });
    
    if (!scannerState) {
      // Get latest block from Tron network
      const latestBlock = await this.tronWeb.trx.getCurrentBlock();
      const startBlock = latestBlock.block_header.raw_data.number - 100; // Start from 100 blocks ago
      
      scannerState = new ScannerState({
        scanner_name: this.scannerName,
        last_processed_block: startBlock,
        is_running: false
      });
      await scannerState.save();
    }
    
    return scannerState;
  }

  /**
   * Scan USDT transfers in block range
   */
  private async scanBlocks(fromBlock: number, toBlock: number): Promise<void> {
    try {
      console.log(`Scanning blocks ${fromBlock} to ${toBlock}`);
      
      // Query TronGrid for USDT transfer events
      const response = await fetch(
        `${process.env.TRON_FULL_NODE}/v1/contracts/${this.usdtContract}/events?` +
        `only_confirmed=true&` +
        `event_name=Transfer&` +
        `min_block_timestamp=${fromBlock}&` +
        `max_block_timestamp=${toBlock}&` +
        `limit=200`,
        {
          headers: {
            'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY || ''
          }
        }
      );

      const data = await response.json();
      
      if (!data.data) {
        console.log('No transfer events found');
        return;
      }

      for (const event of data.data) {
        await this.processTransferEvent(event);
      }
      
    } catch (error) {
      console.error('Error scanning blocks:', error);
      throw error;
    }
  }

  /**
   * Process single transfer event
   */
  private async processTransferEvent(event: any): Promise<void> {
    try {
      const { transaction_id, block_number, event_index, result } = event;
      const { to, value } = result;
      
      // Convert Tron address format
      const toAddress = this.tronWeb.address.fromHex(to);
      
      // Check if it's our wallet
      if (!(await this.isOurWallet(toAddress))) {
        return;
      }

      // Find user by wallet address
      const wallet = await ChildWalletPool.findOne({ 
        wallet_address: toAddress, 
        status: 'ASSIGNED' 
      }).populate('user_id');
      
      if (!wallet || !wallet.user_id) {
        console.log(`No user found for wallet ${toAddress}`);
        return;
      }

      // Check if transaction already exists (idempotent)
      const existingTx = await WalletTransaction.findOne({
        tx_hash: transaction_id,
        log_index: event_index,
        direction: 'IN'
      });

      if (existingTx) {
        console.log(`Transaction already processed: ${transaction_id}`);
        return;
      }

      // Create new wallet transaction
      const walletTx = new WalletTransaction({
        tx_hash: transaction_id,
        log_index: event_index,
        user_id: wallet.user_id,
        wallet_address: toAddress,
        direction: 'IN',
        amount: value,
        block_height: block_number,
        confirmations: 0,
        status: 'PENDING',
        contract_address: this.usdtContract
      });

      await walletTx.save();
      console.log(`New deposit detected: ${value} USDT to ${toAddress}`);
      
    } catch (error) {
      console.error('Error processing transfer event:', error);
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

      for (const tx of pendingTxs) {
        const confirmations = currentBlockNumber - tx.block_height;
        
        await WalletTransaction.findByIdAndUpdate(tx._id, {
          confirmations,
          ...(confirmations >= this.requiredConfirmations && {
            status: 'CONFIRMED',
            confirmed_at: new Date()
          })
        });

        if (confirmations >= this.requiredConfirmations && tx.status === 'PENDING') {
          console.log(`Deposit confirmed: ${tx.amount} USDT for user ${tx.user_id}`);
          // TODO: Trigger sweep job
        }
      }
      
    } catch (error) {
      console.error('Error updating confirmations:', error);
    }
  }

  /**
   * Main scanning loop
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Scanner already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting deposit scanner...');

    try {
      await ScannerState.findOneAndUpdate(
        { scanner_name: this.scannerName },
        { is_running: true, last_scan_time: new Date() }
      );

      while (this.isRunning) {
        try {
          const scannerState = await this.getScannerState();
          const currentBlock = await this.tronWeb.trx.getCurrentBlock();
          const currentBlockNumber = currentBlock.block_header.raw_data.number;
          
          const fromBlock = scannerState.last_processed_block + 1;
          const toBlock = Math.min(fromBlock + 100, currentBlockNumber); // Process max 100 blocks at once
          
          if (fromBlock <= toBlock) {
            await this.scanBlocks(fromBlock, toBlock);
            
            // Update scanner state
            await ScannerState.findOneAndUpdate(
              { scanner_name: this.scannerName },
              { 
                last_processed_block: toBlock,
                last_scan_time: new Date(),
                error_count: 0
              }
            );
          }

          // Update confirmations for pending transactions
          await this.updateConfirmations();

          // Reload wallet cache periodically
          if (Date.now() % (5 * 60 * 1000) < 30000) { // Every 5 minutes
            await this.loadWalletAddressCache();
          }

          // Wait before next scan
          await new Promise(resolve => setTimeout(resolve, 
            parseInt(process.env.SCANNER_INTERVAL || '30000')
          ));
          
        } catch (error) {
          console.error('Scanner iteration error:', error);
          
          await ScannerState.findOneAndUpdate(
            { scanner_name: this.scannerName },
            { 
              $inc: { error_count: 1 },
              last_error: error.message,
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
    }
  }

  /**
   * Stop scanner
   */
  async stop(): Promise<void> {
    console.log('Stopping deposit scanner...');
    this.isRunning = false;
  }
}

export default new DepositScanner();
