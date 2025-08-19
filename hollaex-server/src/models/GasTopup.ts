import { Schema, model, Document } from 'mongoose';

export interface IGasTopup extends Document {
  child_wallet_address: string;
  user_id: string;
  amount_trx: string;
  tx_hash?: string;
  status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED';
  reason: 'INSUFFICIENT_GAS' | 'ENERGY_SHORTAGE' | 'BANDWIDTH_SHORTAGE';
  block_height?: number;
  confirmations: number;
  created_at: Date;
  sent_at?: Date;
  confirmed_at?: Date;
}

const GasTopupSchema = new Schema<IGasTopup>({
  child_wallet_address: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount_trx: { type: String, required: true },
  tx_hash: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'SENT', 'CONFIRMED', 'FAILED'], 
    default: 'PENDING' 
  },
  reason: { 
    type: String, 
    enum: ['INSUFFICIENT_GAS', 'ENERGY_SHORTAGE', 'BANDWIDTH_SHORTAGE'], 
    required: true 
  },
  block_height: { type: Number },
  confirmations: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  sent_at: { type: Date },
  confirmed_at: { type: Date }
});

GasTopupSchema.index({ child_wallet_address: 1 });
GasTopupSchema.index({ user_id: 1 });
GasTopupSchema.index({ status: 1 });
GasTopupSchema.index({ created_at: -1 });

export default model<IGasTopup>('GasTopup', GasTopupSchema);
