import { Request, Response } from 'express';
import { WithdrawalRequest } from '../models';
import PointsService from '../services/points/PointsService';
import TronService from '../services/tron/TronService';
import SecurityService from '../services/security/SecurityService';

export class WithdrawalController {
  /**
   * Request withdrawal
   */
  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const { amount, toAddress } = req.body;
      const userId = req.user.userId;

      // Validate amount
      const minWithdrawal = 20;
      if (parseFloat(amount) < minWithdrawal) {
        return res.status(400).json({
          success: false,
          error: `Minimum withdrawal amount is ${minWithdrawal} USDT`
        });
      }

      // Check user balance
      const userBalance = await PointsService.getUserBalance(userId);
      if (userBalance.balance < parseFloat(amount)) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance'
        });
      }

      // Validate TRC20 address
      if (!this.isValidTronAddress(toAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid TRC20 address'
        });
      }

      // Create withdrawal request
      const withdrawal = await WithdrawalRequest.create({
        user_id: userId,
        amount: amount,
        to_address: toAddress,
        status: 'PENDING',
        requested_at: new Date()
      });

      // Lock user points
      await PointsService.debitPoints(
        userId,
        parseFloat(amount),
        'WITHDRAWAL',
        withdrawal._id.toString(),
        `Withdrawal request: ${amount} USDT`
      );

      res.status(201).json({
        success: true,
        data: {
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          toAddress: withdrawal.to_address,
          status: withdrawal.status
        }
      });

    } catch (error) {
      console.error('Withdrawal request error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create withdrawal request'
      });
    }
  }

  /**
   * Admin approve withdrawal
   */
  static async approveWithdrawal(req: Request, res: Response) {
    try {
      const { withdrawalId } = req.params;
      const adminId = req.user.userId;

      // Check admin role
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const withdrawal = await WithdrawalRequest.findById(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: 'Withdrawal request not found'
        });
      }

      if (withdrawal.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Withdrawal already processed'
        });
      }

      // Execute withdrawal transaction
      const txHash = await this.executeWithdrawal(withdrawal);

      // Update withdrawal status
      await WithdrawalRequest.findByIdAndUpdate(withdrawalId, {
        status: 'APPROVED',
        approved_by: adminId,
        approved_at: new Date(),
        tx_hash: txHash
      });

      res.json({
        success: true,
        data: {
          withdrawalId,
          txHash,
          status: 'APPROVED'
        }
      });

    } catch (error) {
      console.error('Withdrawal approval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve withdrawal'
      });
    }
  }

  /**
   * Execute withdrawal transaction
   */
  private static async executeWithdrawal(withdrawal: any): Promise<string> {
    try {
      // Get master wallet private key
      const encryptedMnemonic = process.env.MASTER_WALLET_MNEMONIC!;
      const encryptionKey = process.env.ENCRYPTION_KEY!;
      const mnemonic = SecurityService.decryptMnemonic(encryptedMnemonic, encryptionKey);
      
      // Derive master private key
      const walletService = new (await import('../services/wallet/WalletService')).WalletService();
      const masterPrivateKey = walletService.deriveChildPrivateKey(0);

      // Send USDT
      const tronService = new TronService();
      const txHash = await tronService.sendTRC20(
        masterPrivateKey,
        withdrawal.to_address,
        (parseFloat(withdrawal.amount) * 1000000).toString(), // Convert to 6 decimals
        process.env.USDT_CONTRACT_ADDRESS!
      );

      // Clear sensitive data
      SecurityService.clearMemory(mnemonic);
      SecurityService.clearMemory(masterPrivateKey);

      console.log(`Withdrawal executed: ${withdrawal.amount} USDT to ${withdrawal.to_address}`);
      
      return txHash;

    } catch (error) {
      console.error('Withdrawal execution failed:', error);
      throw error;
    }
  }

  /**
   * Get user withdrawals
   */
  static async getUserWithdrawals(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;

      const withdrawals = await WithdrawalRequest.find({ user_id: userId })
        .sort({ requested_at: -1 })
        .limit(parseInt(limit as string))
        .skip((parseInt(page as string) - 1) * parseInt(limit as string));

      const total = await WithdrawalRequest.countDocuments({ user_id: userId });

      res.json({
        success: true,
        data: {
          withdrawals,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });

    } catch (error) {
      console.error('Get withdrawals error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get withdrawals'
      });
    }
  }

  /**
   * Admin get pending withdrawals
   */
  static async getPendingWithdrawals(req: Request, res: Response) {
    try {
      // Check admin role
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const withdrawals = await WithdrawalRequest.find({ status: 'PENDING' })
        .populate('user_id', 'username email')
        .sort({ requested_at: -1 });

      res.json({
        success: true,
        data: { withdrawals }
      });

    } catch (error) {
      console.error('Get pending withdrawals error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pending withdrawals'
      });
    }
  }

  /**
   * Validate Tron address
   */
  private static isValidTronAddress(address: string): boolean {
    try {
      return address.startsWith('T') && address.length === 34;
    } catch {
      return false;
    }
  }
}

export default WithdrawalController;