import { Request, Response } from 'express';
import transactionRepository from '../repositories/transactionRepository';

export const getSpendingBreakdown = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type = 'expense' } = req.query;
    const transactions = await transactionRepository.findAllByUser(userId);

    const breakdown: Record<string, number> = {};
    transactions.forEach(tx => {
      // Handle case sensitivity for safety
      if (tx.type.toLowerCase() === (type as string).toLowerCase()) {
        const amount = parseFloat(tx.amount);
        breakdown[tx.category] = (breakdown[tx.category] || 0) + amount;
      }
    });

    const data = Object.keys(breakdown).map(key => ({
      x: key,
      y: breakdown[key]
    }));

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyTrends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await transactionRepository.findAllByUser(userId);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: Record<string, { income: number, expense: number }> = {};

    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const month = months[date.getMonth()];
      if (!trends[month]) trends[month] = { income: 0, expense: 0 };
      
      const amount = parseFloat(tx.amount);
      const type = tx.type.toLowerCase();
      if (type === 'income') {
        trends[month].income += amount;
      } else if (type === 'expense') {
        trends[month].expense += amount;
      }
    });

    const data = months.map(m => ({
      month: m,
      income: trends[m]?.income || 0,
      expense: trends[m]?.expense || 0
    }));

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getHeatmapData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await transactionRepository.findAllByUser(userId);

    const heatmap: Record<string, number> = {};
    transactions.forEach(tx => {
      const dateStr = new Date(tx.timestamp).toISOString().split('T')[0];
      const amount = parseFloat(tx.amount);
      heatmap[dateStr] = (heatmap[dateStr] || 0) + amount;
    });

    // Generate last 35 days including today
    const data = [];
    for (let i = 34; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        value: heatmap[dateStr] || 0
      });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
