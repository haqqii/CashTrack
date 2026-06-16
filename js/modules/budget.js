/**
 * Budget management module
 */

import { Storage } from './storage.js';
import { generateId, getCurrentMonth } from '../utils/format.js';
import { EXPENSE_CATEGORIES } from './transactions.js';

export function addBudget(category, limit) {
  const budgets = Storage.getBudgets();
  const currentMonth = getCurrentMonth();
  const existingIndex = budgets.findIndex(b => b.category === category && b.month === currentMonth);

  if (existingIndex !== -1) {
    budgets[existingIndex].limit = limit;
  } else {
    budgets.push({
      id: generateId(),
      category,
      limit,
      month: currentMonth
    });
  }

  Storage.setBudgets(budgets);
}

export function updateBudget(id, data) {
  const budgets = Storage.getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...data };
    Storage.setBudgets(budgets);
    return budgets[index];
  }
  return null;
}

export function deleteBudget(id) {
  const budgets = Storage.getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  Storage.setBudgets(filtered);
}

export function getBudgetsWithSpent() {
  const budgets = Storage.getBudgets();
  const transactions = Storage.getTransactions();
  const currentMonth = getCurrentMonth();
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);

  return currentMonthBudgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(budget.month))
      .reduce((sum, t) => sum + t.amount, 0);

    return { ...budget, spent };
  });
}

export function getBudgetByCategory(category) {
  const budgets = Storage.getBudgets();
  const currentMonth = getCurrentMonth();
  return budgets.find(b => b.category === category && b.month === currentMonth);
}

export function getAvailableCategories() {
  const budgets = Storage.getBudgets();
  const currentMonth = getCurrentMonth();
  const usedCategories = budgets
    .filter(b => b.month === currentMonth)
    .map(b => b.category);

  return EXPENSE_CATEGORIES.filter(c => !usedCategories.includes(c.id));
}

export function getExpenseCategories() {
  return EXPENSE_CATEGORIES;
}

export default {
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetsWithSpent,
  getBudgetByCategory,
  getAvailableCategories,
  getExpenseCategories
};
