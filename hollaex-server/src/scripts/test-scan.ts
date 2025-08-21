// test-detect-usdt.ts
import dotenv from 'dotenv';
import TronService from '../services/tron/TronService';
import { ChildWalletPool } from '../models';
import mongoose from 'mongoose';
import TronWeb from 'tronweb';

dotenv.config();

function normalizeHexToBase58(addr: string, tronWeb: TronWeb): string {
  if (!addr) return '';
  try {
    // TronGrid trả về 0x..., thay 0x -> 41 để đúng chuẩn tron hex
    const hexAddr = addr.startsWith('0x')
      ? addr.replace(/^0x/, '41')
      : addr;
    return tronWeb.address.fromHex(hexAddr);
  } catch (e) {
    console.error(`⚠️ Cannot normalize address: ${addr}`, e);
    return addr;
  }
}

async function testDetectChildWalletUSDT() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const tronService = new TronService();
  const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULLNODE || 'https://nile.trongrid.io'
  });

  const usdtContract =
    process.env.USDT_CONTRACT_ADDRESS ||
    'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
  const fromBlock = 59778500;
  const toBlock = 59779970;

  console.log(`🧪 Scanning blocks ${fromBlock} - ${toBlock} for USDT`);

  // Load child wallets (giữ dạng Txxxx để so sánh)
  const childWallets = await ChildWalletPool.find({});
  const childBase58Addresses = childWallets.map(w => w.wallet_address);
  console.log(`📌 Loaded ${childBase58Addresses.length} child wallets (Base58) from DB`);

  // Lấy event từ TronGrid
  const events = await tronService.getTRC20TransferEvents(
    usdtContract,
    fromBlock,
    toBlock
  );
  console.log(`🔍 Found ${events.length} USDT transfer events`);

  // Lọc theo ví con (convert TronGrid hex -> Txxx rồi so sánh)
  const matchedEvents = events.filter(ev => {
    const toAddr = normalizeHexToBase58(ev.result?.to, tronWeb);
    return childBase58Addresses.includes(toAddr);
  });

  if (matchedEvents.length === 0) {
    console.log(`❌ No events matched child wallets`);
  } else {
    console.log(`✅ Found ${matchedEvents.length} deposits to child wallets`);
    matchedEvents.forEach((ev, i) => {
      console.log(`\n📥 Deposit Event #${i + 1}`);
      console.log(` TX: ${ev.transaction_id}`);
      console.log(` Block: ${ev.block_number}`);
      console.log(` From: ${normalizeHexToBase58(ev.result?.from, tronWeb)}`);
      console.log(` To (child): ${normalizeHexToBase58(ev.result?.to, tronWeb)}`);
      console.log(` Value: ${ev.result?.value}`);
    });
  }

  await mongoose.disconnect();
}

testDetectChildWalletUSDT().catch(console.error);
