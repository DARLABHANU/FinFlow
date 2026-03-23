import { create } from 'zustand';
import apiClient from '../api/apiClient';
import { notifyTransaction } from '../services/notificationService';
import { useAuthStore } from './authStore';

export interface Transaction {
  id: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: string;
  note: string;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  fetchTransactions: () => Promise<void>;
  createApiTransaction: (data: any) => Promise<void>;
  deleteApiTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
  setTransactions: (transactions) => set({ transactions }),
  fetchTransactions: async () => {
    try {
      const response = await apiClient.get('/transactions');
      const mapped = response.data.map((tx: any) => ({
        id: tx._id || tx.id,
        amount: Number(tx.amount),
        type: tx.type === 'income' ? 'Income' : 'Expense',
        category: tx.category,
        date: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
        note: tx.note || ''
      }));
      mapped.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ transactions: mapped });
    } catch (error) {
      console.log('Failed to fetch transactions', error);
    }
  },
  createApiTransaction: async (data: any) => {
    try {
      const payload = {
        amount: Number(data.amount),
        type: data.type === 'Income' ? 'income' : 'expense',
        category: data.category,
        note: data.note || '',
        timestamp: data.date || new Date().toISOString()
      };
      await apiClient.post('/transactions', payload);
      
      // Trigger Notification
      const symbol = useAuthStore.getState().currency === 'USD' ? '$' : '₹';
      notifyTransaction(data.type, payload.amount, payload.category, symbol);
      
      await get().fetchTransactions();
    } catch (error) {
      console.log('Failed to create transaction', error);
      throw error;
    }
  },
  deleteApiTransaction: async (id: string) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      }));
    } catch (error) {
       console.log('Failed to delete transaction', error);
       throw error;
    }
  }
}));
