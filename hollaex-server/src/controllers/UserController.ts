import { Request, Response } from 'express';
import { User, WalletTransaction, ChildWalletPool } from '../models';
import PointsService from '../services/points/PointsService';

export class UserController {
  /**
   * Get user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId;

      const user = await User.findById(userId).select('-password_hash');
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user wallet
      const wallet = await ChildWalletPool.findOne({ user_id: userId });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            createdAt: user.created_at
          },
          wallet: wallet ? {
            address: wallet.wallet_address,
            derivationIndex: wallet.derivation_index
          } : null
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  /**
   * Get user balance
   */
  static async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user.userId;

      const balance = await PointsService.getUserBalance(userId);

      res.json({
        success: true,
        data: balance
      });

    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get balance'
      });
    }
  }

  /**
   * Get user transactions
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20, type } = req.query;

      // Get wallet transactions
      const wallet = await ChildWalletPool.findOne({ user_id: userId });
      let walletTransactions = [];
      
      if (wallet) {
        const query: any = { to_address: wallet.wallet_address };
        if (type) query.transaction_type = type;

        walletTransactions = await WalletTransaction.find(query)
          .sort({ created_at: -1 })
          .limit(parseInt(limit as string))
          .skip((parseInt(page as string) - 1) * parseInt(limit as string));
      }

      // Get points transactions
      const pointsTransactions = await PointsService.getUserTransactions(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
        type as string
      );

      // Combine and sort transactions
      const allTransactions = [
        ...walletTransactions.map(tx => ({
          id: tx._id,
          type: tx.transaction_type,
          amount: tx.amount,
          status: tx.status,
          txHash: tx.tx_hash,
          date: tx.created_at,
          source: 'blockchain'
        })),
        ...pointsTransactions.map(tx => ({
          id: tx._id,
          type: tx.transaction_type,
          amount: Math.abs(tx.amount),
          status: 'CONFIRMED',
          date: tx.created_at,
          source: 'points'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({
        success: true,
        data: {
          transactions: allTransactions.slice(0, parseInt(limit as string)),
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: allTransactions.length
          }
        }
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transactions'
      });
    }
  }
}

export default UserController;