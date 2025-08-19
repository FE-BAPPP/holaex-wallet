import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  derivationIndex?: number;
  depositAddress?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  derivationIndex: { type: Number, unique: true, sparse: true },
  depositAddress: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);