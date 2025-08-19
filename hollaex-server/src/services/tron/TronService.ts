import TronWeb from 'tronweb';
import { config } from '../../config';
import axios from 'axios';

export interface TRC20Transfer {
  transaction_id: string;
  block_number: number;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  contract_address: string;
}

export interface TronBlock {
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  transactions: string[];
}

export class TronService {
  private tronWeb: any;
  private apiKey: string;
  private fullHost: string;

  constructor() {
    this.fullHost = config.tron.fullHost;
    this.apiKey = config.tron.apiKey;
    
    this.tronWeb = new TronWeb({
      fullHost: this.fullHost,
      headers: { 
        'TRON-PRO-API-KEY': this.apiKey 
      }
    });
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(): Promise<number> {
    try {
      const block = await this.tronWeb.trx.getCurrentBlock();
      return block.block_header.raw_data.number;
    } catch (error) {
      throw new Error(`Failed to get current block: ${error.message}`);
    }
  }

  /**
   * Get TRC20 transfers in block range
   */
  async getTRC20Transfers(
    contractAddress: string,
    fromBlock: number,
    toBlock?: number,
    toAddress?: string
  ): Promise<TRC20Transfer[]> {
    try {
      const url = `${this.fullHost}/v1/contracts/${contractAddress}/events`;
      const params: any = {
        since: fromBlock,
        event_name: 'Transfer',
        limit: 200
      };

      if (toBlock) {
        params.until = toBlock;
      }

      if (toAddress) {
        params.to = toAddress;
      }

      const response = await axios.get(url, {
        params,
        headers: {
          'TRON-PRO-API-KEY': this.apiKey
        }
      });

      return response.data.data?.map((event: any) => ({
        transaction_id: event.transaction_id,
        block_number: event.block_number,
        block_timestamp: event.block_timestamp,
        from: this.tronWeb.address.fromHex(event.result.from),
        to: this.tronWeb.address.fromHex(event.result.to),
        value: event.result.value,
        contract_address: contractAddress
      })) || [];
    } catch (error) {
      throw new Error(`Failed to get TRC20 transfers: ${error.message}`);
    }
  }

  /**
   * Get account TRX balance
   */
  async getTRXBalance(address: string): Promise<string> {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return this.tronWeb.fromSun(balance);
    } catch (error) {
      throw new Error(`Failed to get TRX balance: ${error.message}`);
    }
  }

  /**
   * Get TRC20 token balance
   */
  async getTRC20Balance(address: string, contractAddress: string): Promise<string> {
    try {
      const contract = await this.tronWeb.contract().at(contractAddress);
      const balance = await contract.balanceOf(address).call();
      return balance.toString();
    } catch (error) {
      throw new Error(`Failed to get TRC20 balance: ${error.message}`);
    }
  }

  /**
   * Send TRX
   */
  async sendTRX(fromPrivateKey: string, toAddress: string, amount: string): Promise<string> {
    try {
      const fromAddress = this.tronWeb.address.fromPrivateKey(fromPrivateKey);
      const transaction = await this.tronWeb.transactionBuilder.sendTrx(
        toAddress,
        this.tronWeb.toSun(amount),
        fromAddress
      );

      const signedTransaction = await this.tronWeb.trx.sign(transaction, fromPrivateKey);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTransaction);

      if (!result.result) {
        throw new Error(`Transaction failed: ${result.message || 'Unknown error'}`);
      }

      return result.txid;
    } catch (error) {
      throw new Error(`Failed to send TRX: ${error.message}`);
    }
  }

  /**
   * Send TRC20 tokens
   */
  async sendTRC20(
    fromPrivateKey: string, 
    toAddress: string, 
    amount: string, 
    contractAddress: string
  ): Promise<string> {
    try {
      const fromAddress = this.tronWeb.address.fromPrivateKey(fromPrivateKey);
      const contract = await this.tronWeb.contract().at(contractAddress);
      
      const transaction = await contract.transfer(toAddress, amount).send({
        from: fromAddress,
        feeLimit: config.tron.feeLimit
      });

      return transaction;
    } catch (error) {
      throw new Error(`Failed to send TRC20: ${error.message}`);
    }
  }

  /**
   * Get transaction info
   */
  async getTransactionInfo(txHash: string): Promise<any> {
    try {
      const txInfo = await this.tronWeb.trx.getTransactionInfo(txHash);
      return txInfo;
    } catch (error) {
      throw new Error(`Failed to get transaction info: ${error.message}`);
    }
  }

  /**
   * Get transaction confirmations
   */
  async getTransactionConfirmations(txHash: string): Promise<number> {
    try {
      const currentBlock = await this.getCurrentBlock();
      const txInfo = await this.getTransactionInfo(txHash);
      
      if (!txInfo.blockNumber) {
        return 0;
      }

      return Math.max(0, currentBlock - txInfo.blockNumber + 1);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Estimate energy and bandwidth for TRC20 transfer
   */
  async estimateTRC20TransferCost(fromAddress: string, contractAddress: string): Promise<{
    energyRequired: number;
    bandwidthRequired: number;
    estimatedTrxCost: string;
  }> {
    try {
      // This is a simplified estimation
      // In production, you might want to use more sophisticated methods
      return {
        energyRequired: 65000, // Typical for TRC20 transfer
        bandwidthRequired: 345, // Typical bandwidth
        estimatedTrxCost: '15' // Estimated TRX needed for fees
      };
    } catch (error) {
      throw new Error(`Failed to estimate transfer cost: ${error.message}`);
    }
  }
}