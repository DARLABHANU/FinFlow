import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: string; // Encrypted string
  type: 'income' | 'expense';
  category: string;
  timestamp: Date;
  note?: string; // Encrypted string
  isSynced: boolean;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  note: { type: String },
  isSynced: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to ensure data is encrypted (if not already handled in service)
// It's safer to handle this in the service/repo to avoid double encryption or confusion
// but let's stick to modular repository pattern

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
