export interface User {
  _id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  derivationIndex?: number;
  depositAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  _id: string;
  txHash: string;
  logIndex: number;
  direction: 'IN' | 'OUT';
  childIndex: number;
  userId: string;
  tokenContract: string;
  amount: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  confirmations: number;
  blockNumber: number;
  rawPayload?: any;
  createdAt: Date;
}

export interface TokenSweep {
  _id: string;
  childIndex: number;
  childAddress: string;
  masterAddress: string;
  amount: string;
  sweepTxHash?: string;
  status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED';
  gasTopupTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointTransaction {
  _id: string;
  type: 'DEPOSIT_SWEEP' | 'P2P' | 'PURCHASE' | 'WITHDRAWAL_LOCK' | 'WITHDRAWAL_RELEASE' | 'ADJUST';
  userIdFrom?: string;
  userIdTo?: string;
  amount: string;
  refId?: string;
  description?: string;
  createdAt: Date;
}

export interface WithdrawalRequest {
  _id: string;
  userId: string;
  amount: string;
  toAddress: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED' | 'BROADCASTED' | 'DONE' | 'FAILED';
  txHash?: string;
  adminId?: string;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPoints {
  userId: string;
  balance: string;
  lockedBalance: string;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalUsers: number;
  totalDeposits: string;
  totalWithdrawals: string;
  pendingWithdrawals: number;
  masterBalance: string;
  trxBalance: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DerivedWallet {
  index: number;
  privateKey: string;
  address: string;
  publicKey: string;
}

export interface TRC20Transfer {
  transaction_id: string;
  block_number: number;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  contract_address: string;
}
