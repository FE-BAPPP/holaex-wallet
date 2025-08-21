import mongoose from 'mongoose';
import TronWeb from 'tronweb';
import dotenv from 'dotenv';

// load .env
dotenv.config();

// import model ScannerState (sửa path theo project bạn)
import { ScannerState } from '../models'; 

async function resetScanner(scannerName = 'deposit-scanner') {
  try {
    // ✅ connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // ✅ connect Tron node
    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE,
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY }
    });

    // lấy block hiện tại
    const latestBlock = await tronWeb.trx.getCurrentBlock();
    const currentBlock = latestBlock.block_header.raw_data.number;

    // lùi lại một đoạn để chắc chắn không miss
    const resetBlock = currentBlock - 100;

    // update DB
    const result = await ScannerState.updateOne(
      { scanner_name: scannerName },
      { $set: { last_processed_block: resetBlock } },
      { upsert: true }
    );

    console.log(`🔄 Reset scanner "${scannerName}" về block ${resetBlock}`);
    console.log('📊 Update result:', result);

    await mongoose.disconnect();
    console.log('✅ Done, disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error resetting scanner:', err);
    process.exit(1);
  }
}

// chạy
resetScanner();
