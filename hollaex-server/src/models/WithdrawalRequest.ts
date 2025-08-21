import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  user_id: typeof Schema.Types.ObjectId;
  amount: string;
  to_address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  requested_at: Date;
  approved_by?: typeof Schema.Types.ObjectId;
  approved_at?: Date;
  rejected_by?: typeof Schema.Types.ObjectId;
  rejected_at?: Date;
  rejection_reason?: string;
  tx_hash?: string;
  completed_at?: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  to_address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
    default: 'PENDING'
  },
  requested_at: {
    type: Date,
    default: Date.now
  },
  approved_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: Date,
  rejected_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejected_at: Date,
  rejection_reason: String,
  tx_hash: String,
  completed_at: Date
});

// Indexes
WithdrawalRequestSchema.index({ user_id: 1, status: 1 });
WithdrawalRequestSchema.index({ status: 1, requested_at: -1 });

export const WithdrawalRequest = mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);