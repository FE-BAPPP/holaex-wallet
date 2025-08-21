import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import TronWeb from 'tronweb'; 
import crypto from 'crypto';
import SecurityService from '../services/security/SecurityService';

const bip32 = BIP32Factory(ecc);

export class WalletGenerator {
  private tronWeb: TronWeb; //typescript typing strict

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE || 'https://nile.trongrid.io'
    });
  }

  /**
   * Generate new master wallet with mnemonic
   */
  generateMasterWallet(): {
    mnemonic: string;
    address: string;
    privateKey: string;
    encryptedMnemonic: string;
    encryptionKey: string;
  } {
    // Generate new mnemonic (12 words)
    const mnemonic = bip39.generateMnemonic(128);
    
    // Generate encryption key
    const encryptionKey = SecurityService.generateEncryptionKey();
    
    // Encrypt mnemonic
    const encryptedMnemonic = SecurityService.encryptMnemonic(mnemonic, encryptionKey);
    
    // Derive master private key and address
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const masterPrivateKey = root.privateKey!.toString('hex');
    const masterAddress = this.tronWeb.address.fromPrivateKey(masterPrivateKey);

    return {
      mnemonic,
      address: masterAddress,
      privateKey: masterPrivateKey,
      encryptedMnemonic,
      encryptionKey
    };
  }

  /**
   * Generate child wallet from master mnemonic
   */
  generateChildWallet(mnemonic: string, derivationIndex: number): {
    address: string;
    privateKey: string;
    derivationPath: string;
  } {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    
    // BIP44 path for Tron: m/44'/195'/0'/0/{index}
    const derivationPath = `m/44'/195'/0'/0/${derivationIndex}`;
    const child = root.derivePath(derivationPath);
    
    const privateKey = child.privateKey!.toString('hex');
    const address = this.tronWeb.address.fromPrivateKey(privateKey);

    return {
      address,
      privateKey,
      derivationPath
    };
  }

  /**
   * Batch generate child wallets
   */
  batchGenerateChildWallets(mnemonic: string, startIndex: number, count: number): Array<{
    derivationIndex: number;
    address: string;
    derivationPath: string;
  }> {
    const wallets = [];
    
    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const { address, derivationPath } = this.generateChildWallet(mnemonic, index);
      
      wallets.push({
        derivationIndex: index,
        address,
        derivationPath
      });
    }

    return wallets;
  }

  /**
   * Validate mnemonic phrase
   */
  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Get Tron address info
   */
  async getAddressInfo(address: string): Promise<{
    balance: number;
    exists: boolean;
  }> {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return {
        balance: this.tronWeb.fromSun(balance),
        exists: true
      };
    } catch (error) {
      return {
        balance: 0,
        exists: false
      };
    }
  }

  /**
   * Generate JWT secret
   */
  generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}

export default new WalletGenerator();
