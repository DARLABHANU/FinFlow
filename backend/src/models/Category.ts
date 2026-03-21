import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon: string;
  monthlyBudget: number;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  monthlyBudget: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
