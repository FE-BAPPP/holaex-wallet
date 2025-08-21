import TronWeb from 'tronweb';
import fetch from 'node-fetch';

export class TronService {
  private tronWeb: TronWeb; 

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE || 'https://nile.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY || '' },
      privateKey: '01' // Dummy key, will use specific keys when needed
    });
  }

  /**
   * Get TRX balance
   */
  async getTRXBalance(address: string): Promise<string> {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return this.tronWeb.fromSun(balance).toString();
    } catch (error) {
      console.error('Error getting TRX balance:', error);
      throw error;
    }
  }

  /**
   * Get TRC20 token balance
   */
  async getTRC20Balance(walletAddress: string, contractAddress: string): Promise<string> {
    try {
      const contract = await this.tronWeb.contract().at(contractAddress);
      const balance = await contract.balanceOf(walletAddress).call();
      
      // Convert from 6 decimals to readable format
      return (parseInt(balance.toString()) / 1000000).toString();
    } catch (error) {
      console.error('Error getting TRC20 balance:', error);
      throw error;
    }
  }

  /**
   * Send TRX
   */
  async sendTRX(privateKey: string, toAddress: string, amount: string): Promise<string> {
    try {
      // Create TronWeb instance with private key
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_NODE || 'https://nile.trongrid.io',
        headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY || '' },
        privateKey: privateKey
      });

      // Send TRX
      const transaction = await tronWeb.trx.sendTransaction(
        toAddress,
        tronWeb.toSun(amount)
      );

      if (transaction.result) {
        console.log(`TRX sent: ${amount} TRX to ${toAddress}`);
        return transaction.txid;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error sending TRX:', error);
      throw error;
    }
  }

  /**
   * Send TRC20 token
   */
  async sendTRC20(
    privateKey: string,
    toAddress: string,
    amount: string,
    contractAddress: string
  ): Promise<string> {
    try {
      // Create TronWeb instance with private key
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_NODE || 'https://nile.trongrid.io',
        headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY || '' },
        privateKey: privateKey
      });

      // Get contract instance
      const contract = await tronWeb.contract().at(contractAddress);

      // Send transaction
      const transaction = await contract.transfer(toAddress, amount).send({
        feeLimit: 100000000, // 100 TRX fee limit
      });

      console.log(`TRC20 sent: ${amount} tokens to ${toAddress}`);
      return transaction;
    } catch (error) {
      console.error('Error sending TRC20:', error);
      throw error;
    }
  }

  /**
   * Get latest block number
   */
  async getLatestBlockNumber(): Promise<number> {
    try {
      const block = await this.tronWeb.trx.getCurrentBlock();
      return block.block_header.raw_data.number;
    } catch (error) {
      console.error('Error getting latest block:', error);
      throw error;
    }
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number): Promise<any> {
    try {
      return await this.tronWeb.trx.getBlockByNumber(blockNumber);
    } catch (error) {
      console.error('Error getting block:', error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txHash: string): Promise<any> {
    try {
      return await this.tronWeb.trx.getTransaction(txHash);
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get TRC20 transfer events from block range (with detailed logging)
   */
  async getTRC20TransferEvents(
    contractAddress: string,
    fromBlock: number,
    toBlock: number
  ): Promise<any[]> {
    try {
      console.log(`🔍 Getting TRC20 events for contract: ${contractAddress}`);
      console.log(`📊 Block range: ${fromBlock} to ${toBlock}`);

      // Get timestamps for the block range
      const fromTimestamp = await this.getBlockTimestamp(fromBlock);
      const toTimestamp = await this.getBlockTimestamp(toBlock);
      
      console.log(` Timestamp range: ${fromTimestamp} to ${toTimestamp}`);
      console.log(` From time: ${new Date(fromTimestamp).toISOString()}`);
      console.log(` To time: ${new Date(toTimestamp).toISOString()}`);

      // Query TronGrid for USDT transfer events using correct API
      const apiUrl = process.env.TRON_FULL_NODE?.includes('nile') 
        ? 'https://nile.trongrid.io' 
        : 'https://api.trongrid.io';
        
      const requestUrl = `${apiUrl}/v1/contracts/${contractAddress}/events?` +
        `only_confirmed=true&` +
        `event_name=Transfer&` +
        `min_block_timestamp=${fromTimestamp}&` +
        `max_block_timestamp=${toTimestamp}&` +
        `order_by=block_timestamp,asc&` +
        `limit=200`;

      console.log(` API URL: ${apiUrl}`);
      console.log(` Full request URL: ${requestUrl}`);
      console.log(` API Key: ${process.env.TRON_GRID_API_KEY ? 'SET' : 'NOT SET'}`);

      const response = await fetch(requestUrl, {
        headers: {
          'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      console.log(` Response status: ${response.status} ${response.statusText}`);
      console.log(` Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ TronGrid API error: ${response.status} ${response.statusText}`);
        console.error(`❌ Error response body:`, errorText);
        throw new Error(`TronGrid API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📊 Raw API response:`, JSON.stringify(data, null, 2));
      
      const events = data.data || [];
      console.log(`✅ Found ${events.length} transfer events`);
      
      // Log each event
      events.forEach((event: any, index: number) => {
        console.log(`📝 Event ${index + 1}:`, {
          txHash: event.transaction_id,
          blockNumber: event.block_number,
          from: event.result?.from,
          to: event.result?.to,
          value: event.result?.value
        });
      });

      return events;
    } catch (error) {
      console.error('❌ Error getting TRC20 events:', error);
      return [];
    }
  }

  /**
   * Get block timestamp by block number (with logging)
   */
  private async getBlockTimestamp(blockNumber: number): Promise<number> {
    try {
      console.log(` Getting timestamp for block ${blockNumber}`);
      const block = await this.tronWeb.trx.getBlock(blockNumber);
      const timestamp = block.block_header.raw_data.timestamp;
      console.log(` Block ${blockNumber} timestamp: ${timestamp} (${new Date(timestamp).toISOString()})`);
      return timestamp;
    } catch (error) {
      console.error(`❌ Error getting block ${blockNumber}:`, error);
      return Date.now(); // Fallback to current time
    }
  }

  /**
   * Validate Tron address
   */
  isValidAddress(address: string): boolean {
    try {
      return this.tronWeb.isAddress(address);
    } catch {
      return false;
    }
  }
}

// Export as default class
export default TronService;