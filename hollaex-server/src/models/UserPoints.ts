import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPoints extends Document {
  userId: typeof Schema.Types.ObjectId;
  balance: string;
  lockedBalance: string;
  updatedAt: Date;
}

const UserPointsSchema = new Schema<IUserPoints>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: String, default: '0' },
  lockedBalance: { type: String, default: '0' }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

export const UserPoints = mongoose.model<IUserPoints>('UserPoints', UserPointsSchema);