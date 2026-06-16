/**
 * CashTrack - Bundled Version (No ES Modules)
 * Can be opened directly from file:// protocol
 */

// ==================== STORAGE ====================
const Storage = {
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
  getTransactions() {
    return this.get('cashtrack_transactions') || [];
  },
  setTransactions(transactions) {
    this.set('cashtrack_transactions', transactions);
  },
  getBudgets() {
    return this.get('cashtrack_budgets') || [];
  },
  setBudgets(budgets) {
    this.set('cashtrack_budgets', budgets);
  }
};

// ==================== UTILITIES ====================
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format number with thousand separators (Indonesian style)
function formatNumberInput(value) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  // Add thousand separators
  return parseInt(digits).toLocaleString('id-ID');
}

// Parse formatted number back to integer
function parseFormattedNumber(value) {
  return parseInt(value.replace(/\./g, '')) || 0;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function formatDateInput(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== CATEGORIES ====================
const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Gaji', icon: '💼' },
  { id: 'gift', name: 'Hadiah', icon: '🎁' },
  { id: 'freelance', name: 'Freelance', icon: '💰' },
  { id: 'investment', name: 'Investasi', icon: '📈' },
  { id: 'bonus', name: 'Bonus', icon: '🏆' },
  { id: 'other-in', name: 'Lainnya', icon: '🔄' }
];

const EXPENSE_CATEGORIES = [
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

const CATEGORY_COLORS = {
  'food': '#FF6B6B', 'transport': '#4ECDC4', 'shopping': '#A29BFE',
  'entertainment': '#FFE66D', 'health': '#FF8C42', 'education': '#6C5CE7',
  'home': '#00B894', 'bills': '#E84393', 'gifts': '#FD79A8',
  'other-out': '#636E72', 'salary': '#00B894', 'gift': '#FD79A8',
  'freelance': '#4ECDC4', 'investment': '#A29BFE', 'bonus': '#FFE66D',
  'other-in': '#636E72'
};

function getCategoriesByType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

function getCategoryInfo(categoryId, type) {
  const categories = getCategoriesByType(type);
  return categories.find(c => c.id === categoryId) || { icon: '📝', name: 'Lainnya' };
}

// ==================== TRANSACTIONS ====================
function addTransaction(data) {
  const transactions = Storage.getTransactions();
  const newTransaction = { id: generateId(), ...data, createdAt: Date.now() };
  transactions.unshift(newTransaction);
  Storage.setTransactions(transactions);
  return newTransaction;
}

function updateTransaction(id, data) {
  const transactions = Storage.getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...data };
    Storage.setTransactions(transactions);
    return transactions[index];
  }
  return null;
}

function deleteTransaction(id) {
  const transactions = Storage.getTransactions();
  Storage.setTransactions(transactions.filter(t => t.id !== id));
}

function getTransactionById(id) {
  return Storage.getTransactions().find(t => t.id === id);
}

function getTransactionsByFilter(filter) {
  const transactions = Storage.getTransactions();
  if (filter === 'all') return transactions;
  return transactions.filter(t => t.type === filter);
}

function searchTransactions(query, filter = 'all') {
  const transactions = Storage.getTransactions();
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return getTransactionsByFilter(filter);

  return transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    const category = getCategoryInfo(t.category, t.type);
    const descMatch = t.description?.toLowerCase().includes(searchTerm);
    const categoryMatch = category.name.toLowerCase().includes(searchTerm);
    return descMatch || categoryMatch;
  });
}

function exportTransactionsToCSV(transactions) {
  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah'];
  const rows = transactions.map(t => {
    const category = getCategoryInfo(t.category, t.type);
    return [t.date, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', category.name, t.description || '-', t.amount];
  });
  rows.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(','))
  ].join('\n');

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

// ==================== BUDGET ====================
function addBudget(category, limit) {
  const budgets = Storage.getBudgets();
  const currentMonth = getCurrentMonth();
  const existingIndex = budgets.findIndex(b => b.category === category && b.month === currentMonth);
  if (existingIndex !== -1) {
    budgets[existingIndex].limit = limit;
  } else {
    budgets.push({ id: generateId(), category, limit, month: currentMonth });
  }
  Storage.setBudgets(budgets);
}

function deleteBudget(id) {
  const budgets = Storage.getBudgets();
  Storage.setBudgets(budgets.filter(b => b.id !== id));
}

function getBudgetsWithSpent() {
  const budgets = Storage.getBudgets();
  const transactions = Storage.getTransactions();
  const currentMonth = getCurrentMonth();
  return budgets.filter(b => b.month === currentMonth).map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(budget.month))
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...budget, spent };
  });
}

// ==================== STATISTICS ====================
function calculateStats() {
  const transactions = Storage.getTransactions();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let totalIncome = 0, totalExpense = 0, lastMonthIncome = 0, lastMonthExpense = 0;

  transactions.forEach(t => {
    const date = new Date(t.date);
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (date.getMonth() === lastMonth && date.getFullYear() === lastYear) lastMonthIncome += t.amount;
    } else {
      totalExpense += t.amount;
      if (date.getMonth() === lastMonth && date.getFullYear() === lastYear) lastMonthExpense += t.amount;
    }
  });

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const incomeTrend = lastMonthIncome > 0 ? Math.round(((totalIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;
  const expenseTrend = lastMonthExpense > 0 ? Math.round(((totalExpense - lastMonthExpense) / lastMonthExpense) * 100) : 0;

  return { balance, totalIncome, totalExpense, savingsRate, incomeTrend, expenseTrend };
}

function getMonthlyData(year) {
  const transactions = Storage.getTransactions();
  const data = [];
  // Get all 12 months of the selected year
  for (let i = 0; i < 12; i++) {
    const date = new Date(year, i, 1);
    const monthData = { label: date.toLocaleDateString('id-ID', { month: 'short' }), year: year, month: i, income: 0, expense: 0 };
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === monthData.year && tDate.getMonth() === monthData.month) {
        if (t.type === 'income') monthData.income += t.amount;
        else monthData.expense += t.amount;
      }
    });
    data.push(monthData);
  }
  return data;
}

function getCategoryBreakdown(month, year) {
  const transactions = Storage.getTransactions().filter(t => {
    if (t.type !== 'expense') return false;
    const transDate = new Date(t.date);
    return transDate.getMonth() === month && transDate.getFullYear() === year;
  });

  const categoryTotals = {};
  transactions.forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount; });
  return Object.entries(categoryTotals).map(([category, amount]) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === category) || { icon: '📝', name: 'Lainnya' };
    return { category, icon: cat.icon, name: cat.name, amount, color: CATEGORY_COLORS[category] || '#636E72' };
  }).sort((a, b) => b.amount - a.amount);
}

// ==================== TOAST ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-message">${message}</div><button class="toast-close"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`;
  container.appendChild(toast);
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 4000);
}

// ==================== THEME ====================
function toggleTheme() {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('cashtrack_theme', newTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('cashtrack_theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
}

// ==================== NAVIGATION ====================
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const viewEl = document.getElementById(`${viewName}-view`);
  const tabEl = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
  if (viewEl) viewEl.classList.add('active');
  if (tabEl) tabEl.classList.add('active');
}

// ==================== RENDERING ====================
function renderTransactionItem(transaction) {
  const category = getCategoryInfo(transaction.category, transaction.type);
  const color = CATEGORY_COLORS[transaction.category] || '#636E72';
  return `
    <div class="transaction-item" data-id="${transaction.id}">
      <div class="transaction-icon" style="background: ${color}20; color: ${color}">${category.icon}</div>
      <div class="transaction-details">
        <div class="transaction-desc">${transaction.description || category.name}</div>
        <div class="transaction-meta">${category.name} • ${formatDate(transaction.date)}</div>
      </div>
      <div class="transaction-amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}</div>
      <div class="transaction-actions">
        <button class="btn-icon edit" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
        <button class="btn-icon delete" title="Hapus"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
      </div>
    </div>
  `;
}

function renderTransactions(transactions, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const emptyState = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg><h3>Belum ada transaksi nih</h3><p>Tambah transaksi pertamamu dan mulai tracking! 🚀</p></div>`;
  if (transactions.length === 0) { container.innerHTML = emptyState; return; }
  container.innerHTML = transactions.map(renderTransactionItem).join('');
  container.querySelectorAll('.transaction-item .btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', (e) => { const id = e.target.closest('.transaction-item').dataset.id; openEditModal(id); });
  });
  container.querySelectorAll('.transaction-item .btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.transaction-item').dataset.id;
      openDeleteModal(id);
    });
  });
}

function updateDashboard() {
  const stats = calculateStats();
  if (document.getElementById('totalBalance')) document.getElementById('totalBalance').textContent = formatCurrency(stats.balance);
  if (document.getElementById('totalIncome')) document.getElementById('totalIncome').textContent = formatCurrency(stats.totalIncome);
  if (document.getElementById('totalExpense')) document.getElementById('totalExpense').textContent = formatCurrency(stats.totalExpense);
  if (document.getElementById('savingsRate')) document.getElementById('savingsRate').textContent = `${stats.savingsRate}%`;

  const incomeTrendEl = document.getElementById('incomeTrend');
  if (incomeTrendEl) {
    if (stats.incomeTrend > 0) { incomeTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg><span>+${stats.incomeTrend}% dari bulan lalu</span>`; incomeTrendEl.className = 'stat-trend up'; }
    else if (stats.incomeTrend < 0) { incomeTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg><span>${stats.incomeTrend}% dari bulan lalu</span>`; incomeTrendEl.className = 'stat-trend down'; }
  }

  const expenseTrendEl = document.getElementById('expenseTrend');
  if (expenseTrendEl) {
    if (stats.expenseTrend > 0) { expenseTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg><span>+${stats.expenseTrend}% dari bulan lalu</span>`; expenseTrendEl.className = 'stat-trend down'; }
    else if (stats.expenseTrend < 0) { expenseTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg><span>${stats.expenseTrend}% dari bulan lalu</span>`; expenseTrendEl.className = 'stat-trend up'; }
  }

  const savingsTrendEl = document.getElementById('savingsTrend');
  if (savingsTrendEl) {
    if (stats.savingsRate >= 20) savingsTrendEl.innerHTML = '<span>💪 Luar biasa! Kamu hebat dalam menabung!</span>';
    else if (stats.savingsRate >= 10) savingsTrendEl.innerHTML = '<span>👍 Lumayan! Terus tingkatkan!</span>';
    else if (stats.savingsRate > 0) savingsTrendEl.innerHTML = '<span>💡 Ayo tingkatkan tabunganmu!</span>';
    else savingsTrendEl.innerHTML = '<span>📉 Pengeluaran lebih dari pemasukan</span>';
  }
}

function renderBudgets() {
  const container = document.getElementById('budgetList');
  if (!container) return;
  const budgets = getBudgetsWithSpent();
  if (budgets.length === 0) { container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/></svg><h3>Belum ada budget nih</h3><p>Tambah budget untuk mulai track pengeluaran per kategori! 🎯</p></div>`; return; }
  container.innerHTML = budgets.map(budget => {
    const category = EXPENSE_CATEGORIES.find(c => c.id === budget.category) || { icon: '📝', name: 'Lainnya' };
    const color = CATEGORY_COLORS[budget.category] || '#636E72';
    const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
    const remaining = budget.limit - budget.spent;
    let progressClass = 'normal', remainingClass = '';
    if (percentage >= 100) { progressClass = 'danger'; remainingClass = 'danger'; }
    else if (percentage >= 80) { progressClass = 'warning'; remainingClass = 'warning'; }
    return `<div class="budget-card" data-id="${budget.id}"><div class="budget-header"><div class="budget-category"><div class="budget-icon" style="background: ${color}20; color: ${color}">${category.icon}</div><div class="budget-info"><h4>${category.name}</h4><span>Bulan ini</span></div></div><button class="btn-icon delete" onclick="window.deleteBudgetById('${budget.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button></div><div class="budget-progress"><div class="progress-bar"><div class="progress-fill ${progressClass}" style="width: ${percentage}%"></div></div></div><div class="budget-amounts"><span class="budget-spent">${formatCurrency(budget.spent)} terpakai</span><span class="budget-remaining ${remainingClass}">${formatCurrency(remaining)} tersisa</span></div></div>`;
  }).join('');
}

function renderBarChart() {
  const container = document.getElementById('barChart');
  if (!container) return;
  const chartData = getMonthlyData(statsYear);
  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);
  container.innerHTML = chartData.map(d => `<div class="bar-group"><div class="bar-wrapper"><div class="bar income" style="height: ${(d.income / maxValue) * 100}%"></div><div class="bar expense" style="height: ${(d.expense / maxValue) * 100}%"></div></div><span class="bar-label">${d.label}</span></div>`).join('');
}

function renderDonutChart() {
  const container = document.getElementById('donutChart');
  const legend = document.getElementById('categoryLegend');
  if (!container || !legend) return;
  const categories = getCategoryBreakdown(statsMonth, statsYear);
  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  // Get month label
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const periodLabel = `${monthNames[statsMonth]} ${statsYear}`;

  if (document.getElementById('donutTotal')) document.getElementById('donutTotal').textContent = formatCurrency(total);
  if (categories.length === 0) { container.innerHTML = `<svg viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="80" fill="none" stroke="var(--bg-main)" stroke-width="24"/></svg><div class="donut-center"><div class="value">Rp 0</div><div class="label">${periodLabel}</div></div>`; legend.innerHTML = '<p style="color: var(--text-secondary)">Tidak ada data pengeluaran</p>'; return; }
  let currentAngle = 0;
  const circumference = 2 * Math.PI * 80;
  const gaps = 4;
  const segments = categories.slice(0, 6).map(cat => {
    const percentage = (cat.amount / total) * 100;
    const dashLength = (percentage / 100) * (circumference - gaps * Math.min(categories.length, 6));
    const rotation = currentAngle;
    currentAngle += (percentage / 100) * 360;
    return `<circle cx="100" cy="100" r="80" fill="none" stroke="${cat.color}" stroke-width="24" stroke-dasharray="${dashLength} ${circumference}" stroke-dashoffset="${-rotation * circumference / 360}" transform="rotate(-90 100 100)"/>`;
  });
  container.innerHTML = `<svg viewBox="0 0 200 200" width="200" height="200">${segments.join('')}</svg><div class="donut-center"><div class="value">${formatCurrency(total)}</div><div class="label">${periodLabel}</div></div>`;
  legend.innerHTML = categories.slice(0, 6).map(cat => { const percentage = Math.round((cat.amount / total) * 100); return `<div class="legend-item"><div class="legend-color" style="background: ${cat.color}"></div><div class="legend-info"><div class="legend-name">${cat.icon} ${cat.name}</div><div class="legend-value">${formatCurrency(cat.amount)} (${percentage}%)</div></div></div>`; }).join('');
}

function renderStats() {
  renderBarChart();
  renderDonutChart();
}

function renderCategoryGrid(type, selectedCategory = null) {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  const categories = getCategoriesByType(type);
  grid.innerHTML = categories.map(cat => `<div class="category-item ${selectedCategory === cat.id ? 'selected' : ''}" data-id="${cat.id}"><span class="category-icon">${cat.icon}</span><span class="category-name">${cat.name}</span></div>`).join('');
  grid.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => { grid.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected')); item.classList.add('selected'); });
  });
}

// ==================== MODAL ====================
let currentType = 'income';
let editingTransaction = null;

function openModal(transaction = null) {
  editingTransaction = transaction;
  const modal = document.getElementById('transactionModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('transactionForm');
  const typeBtns = document.querySelectorAll('.type-btn');
  if (title) title.textContent = transaction ? 'Edit Transaksi' : 'Tambah Transaksi';
  if (form) form.reset();
  const dateInput = document.getElementById('transactionDate');
  if (dateInput) dateInput.value = formatDateInput(new Date());
  if (transaction) {
    document.getElementById('transactionId').value = transaction.id;
    document.getElementById('amount').value = formatNumberInput(transaction.amount.toString());
    document.getElementById('description').value = transaction.description;
    document.getElementById('transactionDate').value = transaction.date;
    currentType = transaction.type;
    typeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.type === currentType));
    renderCategoryGrid(currentType, transaction.category);
  } else {
    document.getElementById('transactionId').value = '';
    currentType = 'income';
    typeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.type === 'income'));
    renderCategoryGrid('income');
  }
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('transactionModal');
  if (modal) modal.classList.remove('active');
  editingTransaction = null;
}

function openEditModal(id) {
  const transaction = getTransactionById(id);
  if (transaction) openModal(transaction);
}

// ==================== IMPORT EXCEL ====================
function downloadExcelTemplate() {
  if (typeof XLSX === 'undefined') { showToast('Library Excel belum loaded', 'error'); return; }
  const wb = XLSX.utils.book_new();
  const templateData = [['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah'], ['2024-01-15', 'Pemasukan', 'Gaji', 'Gaji bulanan Januari', 15000000], ['2024-01-16', 'Pengeluaran', 'Makanan', 'Makan siang kantor', 50000], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']];
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  const categoryData = [['KATEGORI PENGELUARAN', '', 'KATEGORI PEMASUKAN', ''], ['Kategori', 'Icon', 'Kategori', 'Icon'], ['Makanan', '🍔', 'Gaji', '💼'], ['Transport', '🚗', 'Freelance', '💰'], ['Belanja', '🛒', 'Bonus', '🏆'], ['Hiburan', '🎮', 'Lainnya', '🔄'], ['Kesehatan', '💊', '', ''], ['Pendidikan', '📚', '', ''], ['Rumah', '🏠', '', ''], ['Tagihan', '📱', '', '']];
  const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
  ws2['!cols'] = [{ wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Referensi');
  XLSX.writeFile(wb, 'cashtrack_template.xlsx');
}

function parseExcelToTransactions(file) {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') { reject(new Error('SheetJS library not loaded')); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const transactions = [], errors = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0 || !row[0]) continue;
          try {
            const [date, type, category, description, amount] = row;
            if (!date || !type || !category || !amount || isNaN(parseFloat(amount))) throw new Error('Data tidak lengkap');
            const normalizedType = type.toString().toLowerCase().trim();
            const finalType = normalizedType.includes('masuk') || normalizedType === 'income' ? 'income' : normalizedType.includes('keluar') || normalizedType === 'expense' ? 'expense' : null;
            if (!finalType) throw new Error(`Jenis "${type}" tidak valid`);
            const categoryMap = { 'makanan': 'food', 'makan': 'food', 'transport': 'transport', 'belanja': 'shopping', 'hiburan': 'entertainment', 'kesehatan': 'health', 'pendidikan': 'education', 'rumah': 'home', 'tagihan': 'bills', 'hadiah': 'gifts', 'lainnya': 'other-out', 'gaji': 'salary', 'freelance': 'freelance', 'investasi': 'investment', 'bonus': 'bonus' };
            const finalCategory = categoryMap[category.toString().toLowerCase().trim()] || (finalType === 'income' ? 'other-in' : 'other-out');
            let parsedDate;
            if (typeof date === 'number') { const dateObj = new Date((date - 25569) * 86400 * 1000); parsedDate = dateObj.toISOString().split('T')[0]; }
            else { const d = new Date(date.toString().trim()); if (isNaN(d.getTime())) throw new Error(`Tanggal "${date}" tidak valid`); parsedDate = d.toISOString().split('T')[0]; }
            transactions.push({ type: finalType, amount: Math.abs(parseFloat(amount)), category: finalCategory, description: description?.toString().trim() || '', date: parsedDate });
          } catch (err) { errors.push(`Baris ${i + 1}: ${err.message}`); }
        }
        resolve({ transactions, errors });
      } catch (err) { reject(new Error('Gagal membaca file Excel: ' + err.message)); }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

// ==================== MAIN APP ====================
let currentFilter = 'all';
let searchQuery = '';
let dateFrom = null;
let dateTo = null;
let statsMonth = new Date().getMonth();
let statsYear = new Date().getFullYear();

function filterByDate(transactions) {
  if (!dateFrom && !dateTo) return transactions;

  return transactions.filter(t => {
    const transDate = new Date(t.date);
    transDate.setHours(0, 0, 0, 0);

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return transDate >= from && transDate <= to;
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      return transDate >= from;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      return transDate <= to;
    }

    return true;
  });
}

function renderAll() {
  let transactions = searchQuery ? searchTransactions(searchQuery, currentFilter) : getTransactionsByFilter(currentFilter);
  transactions = filterByDate(transactions);
  renderTransactions(transactions, 'recentTransactions');
  renderTransactions(transactions, 'allTransactions');
  updateDashboard();
  renderBudgets();
  renderStats();
}

// ==================== DELETE MODAL ====================
let currentDeleteId = null;

function openDeleteModal(id) {
  const transaction = getTransactionById(id);
  if (!transaction) return;

  currentDeleteId = id;
  const category = getCategoryInfo(transaction.category, transaction.type);
  const deleteModal = document.getElementById('deleteModal');
  const deleteModalInfo = document.getElementById('deleteModalInfo');

  if (!deleteModal || !deleteModalInfo) return;

  // Set transaction info in modal
  deleteModalInfo.innerHTML = `
    <div class="info-row">
      <span class="info-label">Kategori</span>
      <span class="info-value">${category.icon} ${category.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Jumlah</span>
      <span class="info-value ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Tanggal</span>
      <span class="info-value">${formatDate(transaction.date)}</span>
    </div>
  `;

  // Show modal
  deleteModal.classList.add('active');
}

function setupDeleteModal() {
  const deleteModal = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelDeleteBtn');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (currentDeleteId) {
        deleteTransaction(currentDeleteId);
        showToast('Transaksi berhasil dihapus!', 'success');
        renderAll();
      }
      closeDeleteModal();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeDeleteModal);
  }

  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }
}

function closeDeleteModal() {
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.classList.remove('active');
  }
  currentDeleteId = null;
}

function initApp() {
  loadTheme();

  // Navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // Add transaction buttons
  [document.getElementById('addTransBtn'), document.getElementById('addTransBtn2')].forEach(btn => {
    if (btn) btn.addEventListener('click', () => openModal());
  });

  // Close modal
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  const modal = document.getElementById('transactionModal');
  if (modal) modal.addEventListener('click', (e) => { if (e.target.classList.contains('modal-overlay')) closeModal(); });

  // Type toggle
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      renderCategoryGrid(currentType);
    });
  });

  // Amount input auto-format
  const amountInput = document.getElementById('amount');
  if (amountInput) {
    amountInput.addEventListener('input', (e) => {
      const cursorPos = e.target.selectionStart;
      const oldLength = e.target.value.length;
      const formatted = formatNumberInput(e.target.value);
      e.target.value = formatted;
      // Adjust cursor position
      const newLength = formatted.length;
      const newPos = cursorPos + (newLength - oldLength);
      e.target.setSelectionRange(newPos, newPos);
    });
    // Format on blur (when user leaves the field)
    amountInput.addEventListener('blur', (e) => {
      if (e.target.value) {
        e.target.value = formatNumberInput(e.target.value);
      }
    });
  }

  // Form submit
  const form = document.getElementById('transactionForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseFormattedNumber(document.getElementById('amount').value);
      const description = document.getElementById('description').value;
      const date = document.getElementById('transactionDate').value;
      const selectedCategory = document.querySelector('.category-item.selected');
      if (!amount || amount <= 0) { showToast('Masukkan jumlah yang valid!', 'error'); return; }
      if (!selectedCategory) { showToast('Pilih kategori dulu!', 'error'); return; }
      const data = { type: currentType, amount, category: selectedCategory.dataset.id, description, date };
      if (editingTransaction) { updateTransaction(editingTransaction.id, data); showToast('Transaksi berhasil diupdate!', 'success'); }
      else { addTransaction(data); showToast('Transaksi berhasil ditambahkan! 🎉', 'success'); }
      closeModal();
      renderAll();
    });
  }

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderAll();
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value;
        if (searchClear) searchClear.style.display = searchQuery ? 'flex' : 'none';
        renderAll();
      }, 300);
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      if (searchClear) searchClear.style.display = 'none';
      renderAll();
    });
  }

  // Date filter
  const dateFromInput = document.getElementById('dateFrom');
  const dateToInput = document.getElementById('dateTo');
  const applyDateFilterBtn = document.getElementById('applyDateFilter');
  const clearDateFilterBtn = document.getElementById('clearDateFilter');

  if (applyDateFilterBtn) {
    applyDateFilterBtn.addEventListener('click', () => {
      dateFrom = dateFromInput?.value || null;
      dateTo = dateToInput?.value || null;
      renderAll();
    });
  }

  if (clearDateFilterBtn) {
    clearDateFilterBtn.addEventListener('click', () => {
      if (dateFromInput) dateFromInput.value = '';
      if (dateToInput) dateToInput.value = '';
      dateFrom = null;
      dateTo = null;
      renderAll();
      showToast('Filter tanggal direset', 'info');
    });
  }

  // Stats month/year filter
  const statsMonthSelect = document.getElementById('statsMonth');
  const statsYearSelect = document.getElementById('statsYear');

  // Populate year dropdown
  if (statsYearSelect) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    let yearOptions = '';
    for (let y = currentYear; y >= startYear; y--) {
      yearOptions += `<option value="${y}" ${y === statsYear ? 'selected' : ''}>${y}</option>`;
    }
    statsYearSelect.innerHTML = yearOptions;
  }

  // Set current month
  if (statsMonthSelect) {
    statsMonthSelect.value = statsMonth;
  }

  // Update period label
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const periodLabelEl = document.getElementById('statsPeriodLabel');
  if (periodLabelEl) {
    periodLabelEl.textContent = `${monthNames[statsMonth]} ${statsYear}`;
  }

  // Month change handler
  if (statsMonthSelect) {
    statsMonthSelect.addEventListener('change', () => {
      statsMonth = parseInt(statsMonthSelect.value);
      if (periodLabelEl) periodLabelEl.textContent = `${monthNames[statsMonth]} ${statsYear}`;
      renderDonutChart();
    });
  }

  // Year change handler
  if (statsYearSelect) {
    statsYearSelect.addEventListener('change', () => {
      statsYear = parseInt(statsYearSelect.value);
      if (periodLabelEl) periodLabelEl.textContent = `${monthNames[statsMonth]} ${statsYear}`;
      renderStats();
    });
  }

  // Export
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      let transactions = searchQuery ? searchTransactions(searchQuery, currentFilter) : getTransactionsByFilter(currentFilter);
      transactions = filterByDate(transactions);
      if (transactions.length === 0) { showToast('Tidak ada transaksi untuk di-export', 'error'); return; }
      exportTransactionsToCSV(transactions);
      showToast('CSV berhasil di-download! 📥', 'success');
    });
  }

  // Template download
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener('click', () => {
      downloadExcelTemplate();
      showToast('Template Excel berhasil di-download! 📊', 'success');
    });
  }

  // Import
  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) {
    importFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        showToast('Memproses file... ⏳', 'info');
        const { transactions, errors } = await parseExcelToTransactions(file);
        if (transactions.length === 0) { showToast('Tidak ada transaksi valid dalam file', 'error'); return; }
        transactions.forEach(t => addTransaction(t));
        let message = `${transactions.length} transaksi berhasil di-import! 🎉`;
        if (errors.length > 0) message += ` (${errors.length} baris dilewati)`;
        showToast(message, 'success');
        renderAll();
        e.target.value = '';
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  // Budget delete
  window.deleteBudgetById = (id) => {
    if (confirm('Yakin mau hapus budget ini?')) { deleteBudget(id); showToast('Budget berhasil dihapus!', 'success'); renderBudgets(); }
  };

  // Delete modal setup
  setupDeleteModal();

  // Initial render
  renderAll();
}

// Start app
document.addEventListener('DOMContentLoaded', initApp);
