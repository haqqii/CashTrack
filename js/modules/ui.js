/**
 * DOM manipulation module
 */

import { formatCurrency, formatDate } from '../utils/format.js';
import {
  CATEGORY_COLORS,
  getCategoriesByType,
  getCategoryInfo,
  deleteTransaction
} from './transactions.js';
import { getBudgetsWithSpent, getExpenseCategories, deleteBudget } from './budget.js';
import { calculateStats, getMonthlyData, getCategoryBreakdown } from './stats.js';

// ==================== TOAST ====================
export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  `;

  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ==================== TRANSACTION RENDERING ====================
export function renderTransactionItem(transaction) {
  const category = getCategoryInfo(transaction.category, transaction.type);
  const color = CATEGORY_COLORS[transaction.category] || '#636E72';

  return `
    <div class="transaction-item" data-id="${transaction.id}">
      <div class="transaction-icon" style="background: ${color}20; color: ${color}">
        ${category.icon}
      </div>
      <div class="transaction-details">
        <div class="transaction-desc">${transaction.description || category.name}</div>
        <div class="transaction-meta">${category.name} • ${formatDate(transaction.date)}</div>
      </div>
      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
      </div>
      <div class="transaction-actions">
        <button class="btn-icon edit" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </button>
        <button class="btn-icon delete" title="Hapus">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </div>
  `;
}

export function renderTransactions(transactions, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const emptyState = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      <h3>Belum ada transaksi nih</h3>
      <p>Tambah transaksi pertamamu dan mulai tracking! 🚀</p>
    </div>
  `;

  if (transactions.length === 0) {
    container.innerHTML = emptyState;
    return;
  }

  container.innerHTML = transactions.map(renderTransactionItem).join('');

  // Add event listeners
  container.querySelectorAll('.transaction-item .btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.transaction-item').dataset.id;
      window.dispatchEvent(new CustomEvent('editTransaction', { detail: { id } }));
    });
  });

  container.querySelectorAll('.transaction-item .btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.transaction-item').dataset.id;
      handleDeleteTransaction(id);
    });
  });
}

function handleDeleteTransaction(id) {
  if (confirm('Yakin mau hapus transaksi ini?')) {
    deleteTransaction(id);
    showToast('Transaksi berhasil dihapus!', 'success');
    window.dispatchEvent(new CustomEvent('transactionsUpdated'));
  }
}

// ==================== DASHBOARD ====================
export function updateDashboard() {
  const stats = calculateStats();

  const totalBalanceEl = document.getElementById('totalBalance');
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const savingsRateEl = document.getElementById('savingsRate');
  const incomeTrendEl = document.getElementById('incomeTrend');
  const expenseTrendEl = document.getElementById('expenseTrend');
  const savingsTrendEl = document.getElementById('savingsTrend');

  if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(stats.balance);
  if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(stats.totalIncome);
  if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(stats.totalExpense);
  if (savingsRateEl) savingsRateEl.textContent = `${stats.savingsRate}%`;

  if (incomeTrendEl) {
    if (stats.incomeTrend > 0) {
      incomeTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg><span>+${stats.incomeTrend}% dari bulan lalu</span>`;
      incomeTrendEl.className = 'stat-trend up';
    } else if (stats.incomeTrend < 0) {
      incomeTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg><span>${stats.incomeTrend}% dari bulan lalu</span>`;
      incomeTrendEl.className = 'stat-trend down';
    }
  }

  if (expenseTrendEl) {
    if (stats.expenseTrend > 0) {
      expenseTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg><span>+${stats.expenseTrend}% dari bulan lalu</span>`;
      expenseTrendEl.className = 'stat-trend down';
    } else if (stats.expenseTrend < 0) {
      expenseTrendEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg><span>${stats.expenseTrend}% dari bulan lalu</span>`;
      expenseTrendEl.className = 'stat-trend up';
    }
  }

  if (savingsTrendEl) {
    if (stats.savingsRate >= 20) {
      savingsTrendEl.innerHTML = '<span>💪 Luar biasa! Kamu hebat dalam menabung!</span>';
    } else if (stats.savingsRate >= 10) {
      savingsTrendEl.innerHTML = '<span>👍 Lumayan! Terus tingkatkan!</span>';
    } else if (stats.savingsRate > 0) {
      savingsTrendEl.innerHTML = '<span>💡 Ayo tingkatkan tabunganmu!</span>';
    } else {
      savingsTrendEl.innerHTML = '<span>📉 Pengeluaran lebih dari pemasukan</span>';
    }
  }
}

// ==================== BUDGET RENDERING ====================
export function renderBudgets() {
  const container = document.getElementById('budgetList');
  if (!container) return;

  const budgets = getBudgetsWithSpent();

  if (budgets.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>
        <h3>Belum ada budget nih</h3>
        <p>Tambah budget untuk mulai track pengeluaran per kategori! 🎯</p>
      </div>
    `;
    return;
  }

  container.innerHTML = budgets.map(budget => {
    const categories = getExpenseCategories();
    const category = categories.find(c => c.id === budget.category) || { icon: '📝', name: 'Lainnya' };
    const color = CATEGORY_COLORS[budget.category] || '#636E72';
    const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
    const remaining = budget.limit - budget.spent;

    let progressClass = 'normal';
    let remainingClass = '';
    if (percentage >= 100) {
      progressClass = 'danger';
      remainingClass = 'danger';
    } else if (percentage >= 80) {
      progressClass = 'warning';
      remainingClass = 'warning';
    }

    return `
      <div class="budget-card" data-id="${budget.id}">
        <div class="budget-header">
          <div class="budget-category">
            <div class="budget-icon" style="background: ${color}20; color: ${color}">${category.icon}</div>
            <div class="budget-info">
              <h4>${category.name}</h4>
              <span>Bulan ini</span>
            </div>
          </div>
          <button class="btn-icon delete" onclick="window.deleteBudgetById('${budget.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
        <div class="budget-progress">
          <div class="progress-bar">
            <div class="progress-fill ${progressClass}" style="width: ${percentage}%"></div>
          </div>
        </div>
        <div class="budget-amounts">
          <span class="budget-spent">${formatCurrency(budget.spent)} terpakai</span>
          <span class="budget-remaining ${remainingClass}">${formatCurrency(remaining)} tersisa</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== STATISTICS RENDERING ====================
export function renderBarChart() {
  const container = document.getElementById('barChart');
  if (!container) return;

  const chartData = getMonthlyData(6);
  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

  container.innerHTML = chartData.map(d => `
    <div class="bar-group">
      <div class="bar-wrapper">
        <div class="bar income" style="height: ${(d.income / maxValue) * 100}%"></div>
        <div class="bar expense" style="height: ${(d.expense / maxValue) * 100}%"></div>
      </div>
      <span class="bar-label">${d.label}</span>
    </div>
  `).join('');
}

export function renderDonutChart() {
  const container = document.getElementById('donutChart');
  const legend = document.getElementById('categoryLegend');
  if (!container || !legend) return;

  const categories = getCategoryBreakdown();
  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  const donutTotalEl = document.getElementById('donutTotal');
  if (donutTotalEl) donutTotalEl.textContent = formatCurrency(total);

  if (categories.length === 0) {
    container.innerHTML = `
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--bg-main)" stroke-width="24"/>
      </svg>
      <div class="donut-center">
        <div class="value">Rp 0</div>
        <div class="label">Total</div>
      </div>
    `;
    legend.innerHTML = '<p style="color: var(--text-secondary)">Tidak ada data pengeluaran</p>';
    return;
  }

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

  container.innerHTML = `
    <svg viewBox="0 0 200 200" width="200" height="200">
      ${segments.join('')}
    </svg>
    <div class="donut-center">
      <div class="value">${formatCurrency(total)}</div>
      <div class="label">Total</div>
    </div>
  `;

  legend.innerHTML = categories.slice(0, 6).map(cat => {
    const percentage = Math.round((cat.amount / total) * 100);
    return `
      <div class="legend-item">
        <div class="legend-color" style="background: ${cat.color}"></div>
        <div class="legend-info">
          <div class="legend-name">${cat.icon} ${cat.name}</div>
          <div class="legend-value">${formatCurrency(cat.amount)} (${percentage}%)</div>
        </div>
      </div>
    `;
  }).join('');
}

export function renderStats() {
  renderBarChart();
  renderDonutChart();
}

// ==================== CATEGORY GRID ====================
export function renderCategoryGrid(type, selectedCategory = null) {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  const categories = getCategoriesByType(type);

  grid.innerHTML = categories.map(cat => `
    <div class="category-item ${selectedCategory === cat.id ? 'selected' : ''}" data-id="${cat.id}">
      <span class="category-icon">${cat.icon}</span>
      <span class="category-name">${cat.name}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      grid.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

// ==================== THEME ====================
export function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('cashtrack_theme', newTheme);
}

export function loadTheme() {
  const savedTheme = localStorage.getItem('cashtrack_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

// ==================== NAVIGATION ====================
export function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  const viewEl = document.getElementById(`${viewName}-view`);
  const tabEl = document.querySelector(`.nav-tab[data-view="${viewName}"]`);

  if (viewEl) viewEl.classList.add('active');
  if (tabEl) tabEl.classList.add('active');
}

export default {
  showToast,
  renderTransactionItem,
  renderTransactions,
  updateDashboard,
  renderBudgets,
  renderBarChart,
  renderDonutChart,
  renderStats,
  renderCategoryGrid,
  toggleTheme,
  loadTheme,
  switchView
};
