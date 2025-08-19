import { Schema, model, Document } from 'mongoose';

export interface IChildWalletPool extends Document {
  derivation_index: number;
  wallet_address: string;
  status: 'FREE' | 'ASSIGNED';
  user_id?: string;
  assigned_at?: Date;
  created_at: Date;
}

const ChildWalletPoolSchema = new Schema<IChildWalletPool>({
  derivation_index: { type: Number, required: true, unique: true },
  wallet_address: { type: String, required: true, unique: true },
  status: { type: String, enum: ['FREE', 'ASSIGNED'], default: 'FREE' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  assigned_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

ChildWalletPoolSchema.index({ status: 1 });
ChildWalletPoolSchema.index({ derivation_index: 1 });

export default model<IChildWalletPool>('ChildWalletPool', ChildWalletPoolSchema);