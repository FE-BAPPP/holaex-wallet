import { Schema, model, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  tx_hash: string;
  log_index: number;
  user_id: string;
  wallet_address: string;
  direction: 'IN' | 'OUT';
  amount: string;
  block_height: number;
  confirmations: number;
  status: 'PENDING' | 'CONFIRMED' | 'SWEPT' | 'FAILED';
  sweep_tx_hash?: string;
  contract_address: string;
  created_at: Date;
  confirmed_at?: Date;
  swept_at?: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  tx_hash: { type: String, required: true },
  log_index: { type: Number, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wallet_address: { type: String, required: true },
  direction: { type: String, enum: ['IN', 'OUT'], required: true },
  amount: { type: String, required: true },
  block_height: { type: Number, required: true },
  confirmations: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'SWEPT', 'FAILED'], default: 'PENDING' },
  sweep_tx_hash: { type: String },
  contract_address: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  confirmed_at: { type: Date },
  swept_at: { type: Date }
});

WalletTransactionSchema.index({ tx_hash: 1, log_index: 1, direction: 1 }, { unique: true });
WalletTransactionSchema.index({ user_id: 1 });
WalletTransactionSchema.index({ status: 1 });
WalletTransactionSchema.index({ wallet_address: 1 });

export default model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);