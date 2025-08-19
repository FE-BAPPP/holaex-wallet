import { User, PointsLedger } from '../../models';
import mongoose from 'mongoose';

export class PointsService {
  
  /**
   * Credit points to user (from deposit sweep)
   */
  async creditPoints(
    userId: string, 
    amount: number, 
    transactionType: 'DEPOSIT' | 'P2P_RECEIVE' | 'REFUND',
    referenceId?: string,
    description?: string
  ): Promise<void> {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get current balance
        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        const balanceBefore = user.points_balance;
        const balanceAfter = balanceBefore + amount;

        // Update user balance
        await User.findByIdAndUpdate(
          userId,
          { 
            points_balance: balanceAfter,
            updated_at: new Date()
          },
          { session }
        );

        // Create ledger entry
        await PointsLedger.create([{
          user_id: userId,
          transaction_type: transactionType,
          amount: amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          reference_id: referenceId,
          description: description
        }], { session });
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Debit points from user (for P2P send, purchase, withdrawal)
   */
  async debitPoints(
    userId: string,
    amount: number,
    transactionType: 'P2P_SEND' | 'PURCHASE' | 'WITHDRAWAL',
    referenceId?: string,
    description?: string
  ): Promise<void> {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get current balance
        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.points_balance < amount) {
          throw new Error('Insufficient balance');
        }

        const balanceBefore = user.points_balance;
        const balanceAfter = balanceBefore - amount;

        // Update user balance
        await User.findByIdAndUpdate(
          userId,
          { 
            points_balance: balanceAfter,
            updated_at: new Date()
          },
          { session }
        );

        // Create ledger entry
        await PointsLedger.create([{
          user_id: userId,
          transaction_type: transactionType,
          amount: -amount, // Negative for debit
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          reference_id: referenceId,
          description: description
        }], { session });
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * P2P Transfer between users (off-chain)
   */
  async p2pTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description?: string
  ): Promise<{ success: boolean; transactionId: string }> {
    const session = await mongoose.startSession();
    const transactionId = new mongoose.Types.ObjectId().toString();
    
    try {
      await session.withTransaction(async () => {
        // Validate users exist
        const fromUser = await User.findById(fromUserId).session(session);
        const toUser = await User.findById(toUserId).session(session);
        
        if (!fromUser || !toUser) {
          throw new Error('User not found');
        }

        if (fromUser.points_balance < amount) {
          throw new Error('Insufficient balance');
        }

        // Debit from sender
        const fromBalanceBefore = fromUser.points_balance;
        const fromBalanceAfter = fromBalanceBefore - amount;

        await User.findByIdAndUpdate(
          fromUserId,
          { 
            points_balance: fromBalanceAfter,
            updated_at: new Date()
          },
          { session }
        );

        // Credit to receiver
        const toBalanceBefore = toUser.points_balance;
        const toBalanceAfter = toBalanceBefore + amount;

        await User.findByIdAndUpdate(
          toUserId,
          { 
            points_balance: toBalanceAfter,
            updated_at: new Date()
          },
          { session }
        );

        // Create ledger entries
        await PointsLedger.create([
          {
            user_id: fromUserId,
            transaction_type: 'P2P_SEND',
            amount: -amount,
            balance_before: fromBalanceBefore,
            balance_after: fromBalanceAfter,
            reference_id: transactionId,
            counterparty_user_id: toUserId,
            description: description || `P2P send to ${toUser.email}`
          },
          {
            user_id: toUserId,
            transaction_type: 'P2P_RECEIVE',
            amount: amount,
            balance_before: toBalanceBefore,
            balance_after: toBalanceAfter,
            reference_id: transactionId,
            counterparty_user_id: fromUserId,
            description: description || `P2P receive from ${fromUser.email}`
          }
        ], { session });
      });

      return { success: true, transactionId };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Purchase with points (off-chain)
   */
  async purchase(
    userId: string,
    merchantUserId: string,
    amount: number,
    productInfo: any
  ): Promise<{ success: boolean; transactionId: string }> {
    const session = await mongoose.startSession();
    const transactionId = new mongoose.Types.ObjectId().toString();
    
    try {
      await session.withTransaction(async () => {
        // Debit from buyer
        await this.debitPoints(
          userId,
          amount,
          'PURCHASE',
          transactionId,
          `Purchase: ${productInfo.name || 'Product'}`
        );

        // Credit to merchant
        await this.creditPoints(
          merchantUserId,
          amount,
          'P2P_RECEIVE',
          transactionId,
          `Sale: ${productInfo.name || 'Product'}`
        );
      });

      return { success: true, transactionId };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user points balance
   */
  async getBalance(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.points_balance;
  }

  /**
   * Get user transaction history
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    const skip = (page - 1) * limit;
    
    return await PointsLedger.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('counterparty_user_id', 'email')
      .lean();
  }
}

export default new PointsService();
