import Bull from 'bull';
import { redis } from '../config/redis';
import { TronService } from '../services/tron/TronService';
import { DepositService } from '../services/deposit/DepositService';
import { config } from '../config';

export const depositScannerQueue = new Bull('deposit-scanner', {
  redis: {
    port: redis.port,
    host: redis.host
  }
});

export class DepositScannerJob {
  private tronService: TronService;
  private depositService: DepositService;

  constructor() {
    this.tronService = new TronService();
    this.depositService = new DepositService();
    this.setupProcessor();
  }

  private setupProcessor() {
    depositScannerQueue.process('scan-deposits', async (job) => {
      try {
        await this.scanNewDeposits();
        return { success: true, timestamp: new Date() };
      } catch (error) {
        console.error('Deposit scanner job failed:', error);
        throw error;
      }
    });
  }

  async scheduleRecurring() {
    // Schedule every 10 seconds
    await depositScannerQueue.add(
      'scan-deposits',
      {},
      {
        repeat: { every: 10000 },
        removeOnComplete: 10,
        removeOnFail: 5
      }
    );
  }

  private async scanNewDeposits() {
    try {
      // Get last processed block
      const lastBlock = await this.depositService.getLastProcessedBlock();
      const currentBlock = await this.tronService.getCurrentBlock();

      if (currentBlock <= lastBlock) {
        return;
      }

      // Get USDT transfers in the block range
      const transfers = await this.tronService.getTRC20Transfers(
        config.tron.usdtContract,
        lastBlock + 1,
        currentBlock
      );

      // Process each transfer
      for (const transfer of transfers) {
        await this.depositService.processDepositTransfer(transfer);
      }

      // Update last processed block
      await this.depositService.updateLastProcessedBlock(currentBlock);
      
      console.log(`Processed blocks ${lastBlock + 1} to ${currentBlock}, found ${transfers.length} transfers`);
    } catch (error) {
      console.error('Error scanning deposits:', error);
      throw error;
    }
  }
}
```

```typescript name=packages/server/src/jobs/SweepJob.ts
import Bull from 'bull';
import { redis } from '../config/redis';
import { SweepService } from '../services/sweep/SweepService';

export const sweepQueue = new Bull('sweep', {
  redis: {
    port: redis.port,
    host: redis.host
  }
});

export class SweepJob {
  private sweepService: SweepService;

  constructor() {
    this.sweepService = new SweepService();
    this.setupProcessor();
  }

  private setupProcessor() {
    sweepQueue.process('process-sweeps', async (job) => {
      try {
        await this.sweepService.processPendingSweeps();
        return { success: true, timestamp: new Date() };
      } catch (error) {
        console.error('Sweep job failed:', error);
        throw error;
      }
    });

    sweepQueue.process('confirm-sweeps', async (job) => {
      try {
        await this.sweepService.confirmSweeps();
        return { success: true, timestamp: new Date() };
      } catch (error) {
        console.error('Sweep confirmation job failed:', error);
        throw error;
      }
    });
  }

  async scheduleRecurring() {
    // Process sweeps every 30 seconds
    await sweepQueue.add(
      'process-sweeps',
      {},
      {
        repeat: { every: 30000 },
        removeOnComplete: 10,
        removeOnFail: 5
      }
    );

    // Confirm sweeps every 20 seconds
    await sweepQueue.add(
      'confirm-sweeps',
      {},
      {
        repeat: { every: 20000 },
        removeOnComplete: 10,
        removeOnFail: 5
      }
    );
  }
}