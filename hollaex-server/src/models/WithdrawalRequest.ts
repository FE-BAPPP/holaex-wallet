import { Schema, model, Document } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  user_id: string;
  amount_points: number;
  amount_usdt: string;
  to_address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  admin_notes?: string;
  tx_hash?: string;
  points_locked: boolean;
  lock_reference_id?: string;
  approved_by?: string;
  approved_at?: Date;
  processed_at?: Date;
  completed_at?: Date;
  created_at: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount_points: { type: Number, required: true },
  amount_usdt: { type: String, required: true },
  to_address: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  admin_notes: { type: String },
  tx_hash: { type: String },
  points_locked: { type: Boolean, default: false },
  lock_reference_id: { type: String },
  approved_by: { type: Schema.Types.ObjectId, ref: 'User' },
  approved_at: { type: Date },
  processed_at: { type: Date },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

WithdrawalRequestSchema.index({ user_id: 1 });
WithdrawalRequestSchema.index({ status: 1 });
WithdrawalRequestSchema.index({ created_at: -1 });

export default model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
