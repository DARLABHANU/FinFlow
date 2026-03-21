import { Request, Response } from 'express';
import transactionService from '../services/transactionService';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await transactionService.getTransactions(userId);
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transaction = await transactionService.createTransaction(userId, req.body);
    res.status(201).json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.updateTransaction(id, req.body);
    res.json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await transactionService.deleteTransaction(id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const syncTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid transactions data' });
    }
    const synced = await transactionService.syncTransactions(userId, transactions);
    res.json(synced);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
