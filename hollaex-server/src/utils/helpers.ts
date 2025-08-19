import { z } from 'zod';

// Validation schemas for API requests
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const withdrawalRequestSchema = z.object({
  amount: z.string()
    .regex(/^\d+$/, 'Amount must be a valid number')
    .refine((val) => BigInt(val) > 0n, 'Amount must be greater than 0'),
  toAddress: z.string()
    .regex(/^T[A-Za-z0-9]{33}$/, 'Invalid TRON address format')
});

export const transferPointsSchema = z.object({
  toUserId: z.string().length(24, 'Invalid user ID'),
  amount: z.string()
    .regex(/^\d+$/, 'Amount must be a valid number')
    .refine((val) => BigInt(val) > 0n, 'Amount must be greater than 0'),
  description: z.string().max(200, 'Description must be at most 200 characters').optional()
});

export const adminApprovalSchema = z.object({
  withdrawalId: z.string().length(24, 'Invalid withdrawal ID'),
  action: z.enum(['approve', 'reject']),
  rejectReason: z.string().max(500, 'Reject reason must be at most 500 characters').optional()
});

// Utility functions
export const isValidTronAddress = (address: string): boolean => {
  return /^T[A-Za-z0-9]{33}$/.test(address);
};

export const isValidAmount = (amount: string): boolean => {
  try {
    const bigIntAmount = BigInt(amount);
    return bigIntAmount > 0n;
  } catch {
    return false;
  }
};

export const formatAmount = (amount: string, decimals: number = 6): string => {
  const bigIntAmount = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = bigIntAmount / divisor;
  const fractionalPart = bigIntAmount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return `${wholePart}.${trimmedFractional}`;
};

export const parseAmount = (amount: string, decimals: number = 6): string => {
  if (amount.includes('.')) {
    const [wholePart, fractionalPart] = amount.split('.');
    const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
    return (BigInt(wholePart) * BigInt(10 ** decimals) + BigInt(paddedFractional)).toString();
  }
  return (BigInt(amount) * BigInt(10 ** decimals)).toString();
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const sanitizeUser = (user: any): any => {
  const sanitized = { ...user };
  delete sanitized.passwordHash;
  delete sanitized.__v;
  return sanitized;
};
