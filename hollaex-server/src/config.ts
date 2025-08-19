import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hollaex',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // HD Wallet
  hdWallet: {
    masterMnemonic: process.env.MASTER_MNEMONIC || '',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  },
  
  // TRON
  tron: {
    fullHost: process.env.TRON_FULL_HOST || 'https://api.shasta.trongrid.io',
    apiKey: process.env.TRON_API_KEY || '',
    usdtContract: process.env.USDT_CONTRACT_ADDRESS || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    feeLimit: parseInt(process.env.FEE_LIMIT || '100000000'), // 100 TRX
    networkType: process.env.TRON_NETWORK || 'shasta', // shasta or mainnet
  },
  
  // Security
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },

  // CORS
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
