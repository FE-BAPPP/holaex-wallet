#!/usr/bin/env node

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DepositScanner from '../services/deposit/DepositScanner';
import SweepService from '../services/sweep/SweepService';

// Load environment variables
dotenv.config();

async function startServices() {
  try {
    console.log('Starting HollaEx Wallet Services...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Start deposit scanner
    await DepositScanner.start();
    console.log('Deposit scanner started');

    // Start sweep service
    await SweepService.start();
    console.log('Sweep service started');

    console.log('\nAll services started successfully!');

    // Keep process running
    process.on('SIGTERM', async () => {
      console.log('\nShutting down services...');
      DepositScanner.stop();
      SweepService.stop();
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start services:', error);
    process.exit(1);
  }
}

startServices();