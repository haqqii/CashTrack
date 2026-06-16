/**
 * Transaction CRUD operations module
 */

import { Storage } from './storage.js';
import { generateId } from '../utils/format.js';

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Gaji', icon: '💼' },
  { id: 'gift', name: 'Hadiah', icon: '🎁' },
  { id: 'freelance', name: 'Freelance', icon: '💰' },
  { id: 'investment', name: 'Investasi', icon: '📈' },
  { id: 'bonus', name: 'Bonus', icon: '🏆' },
  { id: 'other-in', name: 'Lainnya', icon: '🔄' }
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Makanan', icon: '🍔' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'shopping', name: 'Belanja', icon: '🛒' },
  { id: 'entertainment', name: 'Hiburan', icon: '🎮' },
  { id: 'health', name: 'Kesehatan', icon: '💊' },
  { id: 'education', name: 'Pendidikan', icon: '📚' },
  { id: 'home', name: 'Rumah', icon: '🏠' },
  { id: 'bills', name: 'Tagihan', icon: '📱' },
  { id: 'gifts', name: 'Hadiah', icon: '🎁' },
  { id: 'other-out', name: 'Lainnya', icon: '🔄' }
];

export const CATEGORY_COLORS = {
  'food': '#FF6B6B',
  'transport': '#4ECDC4',
  'shopping': '#A29BFE',
  'entertainment': '#FFE66D',
  'health': '#FF8C42',
  'education': '#6C5CE7',
  'home': '#00B894',
  'bills': '#E84393',
  'gifts': '#FD79A8',
  'other-out': '#636E72',
  'salary': '#00B894',
  'gift': '#FD79A8',
  'freelance': '#4ECDC4',
  'investment': '#A29BFE',
  'bonus': '#FFE66D',
  'other-in': '#636E72'
};

export function addTransaction(data) {
  const transactions = Storage.getTransactions();
  const newTransaction = {
    id: generateId(),
    ...data,
    createdAt: Date.now()
  };
  transactions.unshift(newTransaction);
  Storage.setTransactions(transactions);
  return newTransaction;
}

export function updateTransaction(id, data) {
  const transactions = Storage.getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...data };
    Storage.setTransactions(transactions);
    return transactions[index];
  }
  return null;
}

export function deleteTransaction(id) {
  const transactions = Storage.getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  Storage.setTransactions(filtered);
}

export function getTransactionById(id) {
  const transactions = Storage.getTransactions();
  return transactions.find(t => t.id === id);
}

export function getTransactionsByFilter(filter) {
  const transactions = Storage.getTransactions();
  if (filter === 'all') return transactions;
  return transactions.filter(t => t.type === filter);
}

export function searchTransactions(query, filter = 'all') {
  const transactions = Storage.getTransactions();
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return getTransactionsByFilter(filter);
  }

  return transactions.filter(t => {
    // Apply type filter first
    if (filter !== 'all' && t.type !== filter) return false;

    // Search in description and category name
    const category = getCategoryInfo(t.category, t.type);
    const descMatch = t.description?.toLowerCase().includes(searchTerm);
    const categoryMatch = category.name.toLowerCase().includes(searchTerm);

    return descMatch || categoryMatch;
  });
}

export function exportTransactionsToCSV(transactions) {
  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah'];
  const rows = transactions.map(t => {
    const category = getCategoryInfo(t.category, t.type);
    return [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      category.name,
      t.description || '-',
      t.amount
    ];
  });

  // Sort by date (newest first)
  rows.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell =>
      typeof cell === 'string' && cell.includes(',')
        ? `"${cell}"`
        : cell
    ).join(','))
  ].join('\n');

  // Create download
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `cashtrack_export_${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getTransactionsByMonth(year, month) {
  const transactions = Storage.getTransactions();
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

export function getCategoriesByType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryInfo(categoryId, type) {
  const categories = getCategoriesByType(type);
  return categories.find(c => c.id === categoryId) || { icon: '📝', name: 'Lainnya' };
}

export default {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactionsByFilter,
  getTransactionsByMonth,
  getCategoriesByType,
  getCategoryInfo,
  searchTransactions,
  exportTransactionsToCSV
};
