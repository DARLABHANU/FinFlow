import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  avatar?: string;
  currencyPreference: string;
  isBiometricEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  currencyPreference: { type: String, default: 'USD' },
  isBiometricEnabled: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
