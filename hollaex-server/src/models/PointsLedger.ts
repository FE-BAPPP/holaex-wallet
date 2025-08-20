import { Schema, model, Document } from 'mongoose';

export interface IPointsLedger extends Document {
  user_id: typeof Schema.Types.ObjectId;
  transaction_type: 'DEPOSIT' | 'P2P_SEND' | 'P2P_RECEIVE' | 'PURCHASE' | 'WITHDRAWAL' | 'REFUND';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id?: string; // Có thể là wallet_transaction_id, withdrawal_id, etc.
  counterparty_user_id?: string; // Cho P2P transactions
  description?: string;
  created_at: Date;
}

const PointsLedgerSchema = new Schema<IPointsLedger>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transaction_type: { 
    type: String, 
    enum: ['DEPOSIT', 'P2P_SEND', 'P2P_RECEIVE', 'PURCHASE', 'WITHDRAWAL', 'REFUND'], 
    required: true 
  },
  amount: { type: Number, required: true },
  balance_before: { type: Number, required: true },
  balance_after: { type: Number, required: true },
  reference_id: { type: String },
  counterparty_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  created_at: { type: Date, default: Date.now }
});

PointsLedgerSchema.index({ user_id: 1, created_at: -1 });
PointsLedgerSchema.index({ transaction_type: 1 });
PointsLedgerSchema.index({ reference_id: 1 });

export default model<IPointsLedger>('PointsLedger', PointsLedgerSchema);
