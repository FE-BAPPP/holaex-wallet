import { Schema, model, Document } from 'mongoose';

export interface IScannerState extends Document {
  scanner_name: string;
  last_processed_block: number;
  last_scan_time: Date;
  is_running: boolean;
  error_count: number;
  last_error?: string;
  last_error_time?: Date;
  created_at: Date;
  updated_at: Date;
}

const ScannerStateSchema = new Schema<IScannerState>({
  scanner_name: { type: String, required: true, unique: true },
  last_processed_block: { type: Number, required: true, default: 0 },
  last_scan_time: { type: Date, default: Date.now },
  is_running: { type: Boolean, default: false },
  error_count: { type: Number, default: 0 },
  last_error: { type: String },
  last_error_time: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ScannerStateSchema.index({ scanner_name: 1 });
ScannerStateSchema.index({ is_running: 1 });

export default model<IScannerState>('ScannerState', ScannerStateSchema);
