/**
 * Statistics calculations module
 */

import { Storage } from './storage.js';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from './transactions.js';

export function calculateStats() {
  const transactions = Storage.getTransactions();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let totalIncome = 0;
  let totalExpense = 0;
  let lastMonthIncome = 0;
  let lastMonthExpense = 0;

  transactions.forEach(t => {
    const date = new Date(t.date);
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (date.getMonth() === lastMonth && date.getFullYear() === lastYear) {
        lastMonthIncome += t.amount;
      }
    } else {
      totalExpense += t.amount;
      if (date.getMonth() === lastMonth && date.getFullYear() === lastYear) {
        lastMonthExpense += t.amount;
      }
    }
  });

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const incomeTrend = lastMonthIncome > 0
    ? Math.round(((totalIncome - lastMonthIncome) / lastMonthIncome) * 100)
    : 0;
  const expenseTrend = lastMonthExpense > 0
    ? Math.round(((totalExpense - lastMonthExpense) / lastMonthExpense) * 100)
    : 0;

  return { balance, totalIncome, totalExpense, savingsRate, incomeTrend, expenseTrend };
}

export function getMonthlyData(months = 6) {
  const transactions = Storage.getTransactions();
  const now = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthData = {
      label: date.toLocaleDateString('id-ID', { month: 'short' }),
      year: date.getFullYear(),
      month: date.getMonth(),
      income: 0,
      expense: 0
    };

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === monthData.year && tDate.getMonth() === monthData.month) {
        if (t.type === 'income') {
          monthData.income += t.amount;
        } else {
          monthData.expense += t.amount;
        }
      }
    });

    data.push(monthData);
  }

  return data;
}

export function getCategoryBreakdown(month, year) {
  const transactions = Storage.getTransactions().filter(t => {
    if (t.type !== 'expense') return false;
    const transDate = new Date(t.date);
    return transDate.getMonth() === month && transDate.getFullYear() === year;
  });

  const categoryTotals = {};

  transactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  return Object.entries(categoryTotals)
    .map(([category, amount]) => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === category) || { icon: '📝', name: 'Lainnya' };
      return {
        category,
        icon: cat.icon,
        name: cat.name,
        amount,
        color: CATEGORY_COLORS[category] || '#636E72'
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getTotalByType(type) {
  const transactions = Storage.getTransactions().filter(t => t.type === type);
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export default {
  calculateStats,
  getMonthlyData,
  getCategoryBreakdown,
  getTotalByType
};
