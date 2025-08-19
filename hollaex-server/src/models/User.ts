import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  derivation_index?: number;
  wallet_address?: string;
  points_balance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  derivation_index: { type: Number, unique: true, sparse: true },
  wallet_address: { type: String, unique: true, sparse: true },
  points_balance: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.index({ email: 1 });
UserSchema.index({ wallet_address: 1 });

export default model<IUser>('User', UserSchema);