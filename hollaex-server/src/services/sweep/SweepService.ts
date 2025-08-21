import TronWeb from 'tronweb';
import { WalletTransaction, ChildWalletPool } from '../../models';
import WalletService from '../wallet/WalletService';
import PointsService from '../points/PointsService';
import TronService from '../tron/TronService';
import SecurityService from '../security/SecurityService';

export class SweepService {
  private tronService: TronService;
  private isRunning: boolean = false;
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.tronService = new TronService();
  }

  /**
   * Start sweep service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Sweep service already running');
      return;
    }

    console.log('🔄 Starting sweep service...');
    this.isRunning = true;

    // Run sweep every 30 seconds
    this.sweepInterval = setInterval(async () => {
      try {
        await this.sweepConfirmedDeposits();
      } catch (error) {
        console.error('Sweep error:', error);
      }
    }, 30000);

    console.log('✅ Sweep service started');
  }

  /**
   * Stop sweep service
   */
  stop(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Sweep service stopped');
  }

  /**
   * Sweep confirmed deposits to master wallet
   */
  async sweepConfirmedDeposits(): Promise<void> {
    try {
      // Get confirmed deposits that haven't been swept
      const deposits = await WalletTransaction.find({
        status: 'CONFIRMED',
        swept: false,
        transaction_type: 'DEPOSIT'
      }).limit(10);

      if (deposits.length === 0) {
        return;
      }

      console.log(`Found ${deposits.length} deposits to sweep`);

      for (const deposit of deposits) {
        try {
          await this.sweepDeposit(deposit);
        } catch (error) {
          console.error(`Failed to sweep deposit ${deposit._id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error in sweepConfirmedDeposits:', error);
    }
  }

  /**
   * Sweep individual deposit
   */
  private async sweepDeposit(deposit: any): Promise<void> {
    console.log(`Sweeping deposit ${deposit._id}: ${deposit.amount} USDT`);

    // Get child wallet info
    const childWallet = await ChildWalletPool.findOne({
      wallet_address: deposit.to_address
    });

    if (!childWallet) {
      console.error(`Child wallet not found: ${deposit.to_address}`);
      return;
    }

    // Check TRX balance for gas
    const trxBalance = await this.tronService.getTRXBalance(deposit.to_address);
    const requiredTrx = 10; // 10 TRX for gas

    if (parseFloat(trxBalance) < requiredTrx) {
      console.log(`Insufficient TRX, topping up: ${deposit.to_address}`);
      await this.topupTrx(deposit.to_address, requiredTrx);
      
      // Wait a bit for confirmation
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Derive private key for signing
    const walletService = new WalletService();
    const privateKey = walletService.deriveChildPrivateKey(childWallet.derivation_index);

    try {
      // Send USDT to master wallet
      const txHash = await this.tronService.sendTRC20(
        privateKey,
        process.env.MASTER_WALLET_ADDRESS!,
        (parseFloat(deposit.amount) * 1000000).toString(), // Convert to 6 decimals
        process.env.USDT_CONTRACT_ADDRESS!
      );

      // Update deposit as swept
      await WalletTransaction.findByIdAndUpdate(deposit._id, {
        swept: true,
        sweep_tx_hash: txHash,
        swept_at: new Date()
      });

      // Credit points to user
      await PointsService.creditPoints(
        deposit.user_id,
        parseFloat(deposit.amount),
        'DEPOSIT',
        deposit._id.toString(),
        `Deposit sweep: ${deposit.amount} USDT`
      );

      console.log(`✅ Swept ${deposit.amount} USDT, credited ${deposit.amount} points to user ${deposit.user_id}`);

    } finally {
      // Clear private key from memory
      SecurityService.clearMemory(privateKey);
    }
  }

  /**
   * Top up TRX for gas fees
   */
  private async topupTrx(childAddress: string, amount: number): Promise<void> {
    try {
      // Derive master private key
      const encryptedMnemonic = process.env.MASTER_WALLET_MNEMONIC!;
      const encryptionKey = process.env.ENCRYPTION_KEY!;
      const mnemonic = SecurityService.decryptMnemonic(encryptedMnemonic, encryptionKey);
      
      // Get master private key (index 0)
      const walletService = new WalletService();
      const masterPrivateKey = walletService.deriveChildPrivateKey(0);

      // Send TRX
      const txHash = await this.tronService.sendTRX(
        masterPrivateKey,
        childAddress,
        amount.toString()
      );

      console.log(` Topped up ${amount} TRX to ${childAddress}, tx: ${txHash}`);

      // Clear sensitive data
      SecurityService.clearMemory(mnemonic);
      SecurityService.clearMemory(masterPrivateKey);

    } catch (error) {
      console.error('TRX topup failed:', error);
      throw error;
    }
  }

  /**
   * Get sweep statistics
   */
  async getStats(): Promise<{
    pendingSweeps: number;
    completedSweeps: number;
    totalSweptAmount: number;
  }> {
    const [pending, completed, sweptTotal] = await Promise.all([
      WalletTransaction.countDocuments({
        status: 'CONFIRMED',
        swept: false,
        transaction_type: 'DEPOSIT'
      }),
      WalletTransaction.countDocuments({
        swept: true,
        transaction_type: 'DEPOSIT'
      }),
      WalletTransaction.aggregate([
        { $match: { swept: true, transaction_type: 'DEPOSIT' } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
      ])
    ]);

    return {
      pendingSweeps: pending,
      completedSweeps: completed,
      totalSweptAmount: sweptTotal[0]?.total || 0
    };
  }
}

export default new SweepService();