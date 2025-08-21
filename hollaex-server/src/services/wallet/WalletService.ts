import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import TronWeb from 'tronweb';
import crypto from 'crypto';
import { ChildWalletPool, User } from '../../models';
import SecurityService from '../security/SecurityService';

const bip32 = BIP32Factory(ecc);

export class WalletService {
  private tronWeb: TronWeb; //typescript typing strict
  private encryptionKey: string;

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE || 'https://nile.trongrid.io'
    });
    this.encryptionKey = process.env.ENCRYPTION_KEY!;
  }

  // Derive child wallet address from master mnemonic
  private deriveChildAddress(derivationIndex: number): string {
    let mnemonic: string | null = null;
    let seed: Buffer | null = null;
    let root: any = null;
    let child: any = null;
    let privateKey: string | null = null;

    try {
      // Decrypt mnemonic from environment (in production, get from KMS)
      const encryptedMnemonic = process.env.MASTER_WALLET_MNEMONIC!;
      mnemonic = SecurityService.decryptMnemonic(encryptedMnemonic, this.encryptionKey);
      
      SecurityService.auditLog('MNEMONIC_ACCESS', 'system', { operation: 'derive_address', derivationIndex });
      
      seed = bip39.mnemonicToSeedSync(mnemonic);
      root = bip32.fromSeed(seed);
      
      // BIP44 path: m/44'/195'/0'/0/{index}
      const path = `m/44'/195'/0'/0/${derivationIndex}`;
      child = root.derivePath(path);
      
      privateKey = child.privateKey!.toString('hex');
      const address = this.tronWeb.address.fromPrivateKey(privateKey);
      
      return address;
    } finally {
      // Securely clear sensitive data from memory
      if (mnemonic) SecurityService.clearMemory(mnemonic);
      if (seed) SecurityService.clearMemory(seed);
      if (privateKey) SecurityService.clearMemory(privateKey);
      if (root) SecurityService.clearMemory(root);
      if (child) SecurityService.clearMemory(child);
    }
  }

  // Derive private key for signing (temporary, in-memory only)
  deriveChildPrivateKey(derivationIndex: number): string {
    const mnemonic = process.env.MASTER_WALLET_MNEMONIC!;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    
    const path = `m/44'/195'/0'/0/${derivationIndex}`;
    const child = root.derivePath(path);
    
    return child.privateKey!.toString('hex');
  }

  // Generate batch of child wallets
  async generateChildWalletBatch(startIndex: number, count: number): Promise<void> {
    const wallets = [];
    
    for (let i = startIndex; i < startIndex + count; i++) {
      const address = this.deriveChildAddress(i);
      wallets.push({
        derivation_index: i,
        wallet_address: address,
        status: 'FREE'
      });
    }

    await ChildWalletPool.insertMany(wallets, { ordered: false });
  }

  // Assign wallet to user during onboarding
  async assignWalletToUser(userId: string): Promise<{ address: string; derivationIndex: number }> {
    const session = await ChildWalletPool.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Find and lock a free wallet
        const wallet = await ChildWalletPool.findOneAndUpdate(
          { status: 'FREE' },
          { 
            status: 'ASSIGNED',
            user_id: userId,
            assigned_at: new Date()
          },
          { new: true, session }
        );

        if (!wallet) {
          throw new Error('No available wallets in pool');
        }

        // Update user with wallet info
        await User.findByIdAndUpdate(
          userId,
          {
            derivation_index: wallet.derivation_index,
            wallet_address: wallet.wallet_address
          },
          { session }
        );

        return {
          address: wallet.wallet_address,
          derivationIndex: wallet.derivation_index
        };
      });
    } finally {
      await session.endSession();
    }

    // Check if we need to generate more wallets
    await this.checkAndRefillPool();
    
    const user = await User.findById(userId);
    return {
      address: user!.wallet_address!,
      derivationIndex: user!.derivation_index!
    };
  }

  // Check and refill wallet pool if needed
  async checkAndRefillPool(): Promise<void> {
    const threshold = parseInt(process.env.DERIVATION_POOL_THRESHOLD || '200');
    const freeCount = await ChildWalletPool.countDocuments({ status: 'FREE' });
    
    if (freeCount < threshold) {
      const lastWallet = await ChildWalletPool.findOne().sort({ derivation_index: -1 });
      const startIndex = lastWallet ? lastWallet.derivation_index + 1 : 0;
      
      await this.generateChildWalletBatch(startIndex, 1000);
      console.log(`Generated 1000 new child wallets starting from index ${startIndex}`);
    }
  }

  // Get TRX balance for gas fees
  async getTrxBalance(address: string): Promise<number> {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return this.tronWeb.fromSun(balance);
    } catch (error) {
      console.error('Error getting TRX balance:', error);
      return 0;
    }
  }

  // Get USDT balance
  async getUsdtBalance(address: string): Promise<number> {
    try {
      const contract = await this.tronWeb.contract().at(process.env.USDT_CONTRACT_ADDRESS!);
      const balance = await contract.balanceOf(address).call();
      return parseInt(balance.toString()) / 1000000; // USDT has 6 decimals
    } catch (error) {
      console.error('Error getting USDT balance:', error);
      return 0;
    }
  }
}

export default new WalletService();