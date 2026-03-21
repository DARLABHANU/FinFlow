import transactionRepository from '../repositories/transactionRepository';

export class TransactionService {
  async getTransactions(userId: string) {
    return await transactionRepository.findAllByUser(userId);
  }

  async createTransaction(userId: string, data: any) {
    return await transactionRepository.create(userId, data);
  }

  async updateTransaction(id: string, data: any) {
    return await transactionRepository.update(id, data);
  }

  async deleteTransaction(id: string) {
    return await transactionRepository.delete(id);
  }

  async syncTransactions(userId: string, dataArray: any[]) {
    return await transactionRepository.bulkSync(userId, dataArray);
  }
}

export default new TransactionService();
