import Transaction, { ITransaction } from '../models/Transaction';
import { encrypt, decrypt } from '../utils/encryption';

export class TransactionRepository {
  private encryptSensitive(data: any) {
    const cloned = { ...data };
    if (cloned.amount) {
      cloned.amount = encrypt(cloned.amount.toString());
    }
    if (cloned.note) {
      cloned.note = encrypt(cloned.note);
    }
    return cloned;
  }

  private decryptSensitive(transaction: ITransaction) {
    const raw = transaction.toObject();
    if (raw.amount) {
      raw.amount = decrypt(raw.amount);
    }
    if (raw.note) {
      raw.note = decrypt(raw.note);
    }
    return raw;
  }

  async create(userId: string, data: Partial<ITransaction>): Promise<any> {
    const encryptedData = this.encryptSensitive({ ...data, userId });
    const transaction = new Transaction(encryptedData);
    const saved = await transaction.save();
    return this.decryptSensitive(saved);
  }

  async findAllByUser(userId: string): Promise<any[]> {
    const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });
    return transactions.map(t => this.decryptSensitive(t));
  }

  async findById(id: string): Promise<any | null> {
    const transaction = await Transaction.findById(id);
    return transaction ? this.decryptSensitive(transaction) : null;
  }

  async update(id: string, data: Partial<ITransaction>): Promise<any | null> {
    const encryptedData = this.encryptSensitive(data);
    const updated = await Transaction.findByIdAndUpdate(id, encryptedData, { new: true });
    return updated ? this.decryptSensitive(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await Transaction.findByIdAndDelete(id);
    return result !== null;
  }

  async bulkSync(userId: string, dataArray: any[]): Promise<any[]> {
    const encryptedArray = dataArray.map(data => 
      this.encryptSensitive({ ...data, userId, isSynced: true })
    );
    const saved = await Transaction.insertMany(encryptedArray);
    return (saved as unknown as ITransaction[]).map(t => this.decryptSensitive(t));
  }
}

export default new TransactionRepository();
