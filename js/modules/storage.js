/**
 * LocalStorage handling module
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'cashtrack_transactions',
  BUDGETS: 'cashtrack_budgets',
  THEME: 'cashtrack_theme'
};

export const Storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Transactions
  getTransactions() {
    return this.get(STORAGE_KEYS.TRANSACTIONS) || [];
  },

  setTransactions(transactions) {
    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  // Budgets
  getBudgets() {
    return this.get(STORAGE_KEYS.BUDGETS) || [];
  },

  setBudgets(budgets) {
    this.set(STORAGE_KEYS.BUDGETS, budgets);
  },

  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME);
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
};

export default Storage;
