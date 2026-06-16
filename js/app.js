/**
 * CashTrack - Main Application Entry Point
 */

import {
  addTransaction,
  updateTransaction,
  getTransactionById,
  getTransactionsByFilter,
  getCategoriesByType,
  searchTransactions,
  exportTransactionsToCSV
} from './modules/transactions.js';
import {
  downloadExcelTemplate,
  parseExcelToTransactions
} from '../assets/template_import.js';
import { addBudget, deleteBudget } from './modules/budget.js';
import {
  showToast,
  renderTransactions,
  updateDashboard,
  renderBudgets,
  renderStats,
  renderCategoryGrid,
  toggleTheme,
  loadTheme,
  switchView
} from './modules/ui.js';
import { formatDateInput } from './utils/format.js';
import { validateTransaction, validateBudget } from './utils/validators.js';

// ==================== STATE ====================
let currentFilter = 'all';
let currentType = 'income';
let editingTransaction = null;
let searchQuery = '';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadTheme();
  setupNavigation();
  setupThemeToggle();
  setupTransactionModal();
  setupBudgetForm();
  setupFilters();
  setupSearch();
  setupExport();
  setupImport();
  setupCustomEvents();
  renderAll();
}

// ==================== NAVIGATION ====================
function setupNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
}

// ==================== THEME ====================
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// ==================== TRANSACTION MODAL ====================
function setupTransactionModal() {
  const addBtn1 = document.getElementById('addTransBtn');
  const addBtn2 = document.getElementById('addTransBtn2');
  const closeBtn = document.getElementById('closeModal');
  const modal = document.getElementById('transactionModal');
  const form = document.getElementById('transactionForm');
  const typeBtns = document.querySelectorAll('.type-btn');

  // Open modal
  [addBtn1, addBtn2].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => openModal());
    }
  });

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });
  }

  // Type toggle
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      renderCategoryGrid(currentType);
    });
  });

  // Form submit
  if (form) {
    form.addEventListener('submit', handleTransactionSubmit);
  }
}

function openModal(transaction = null) {
  editingTransaction = transaction;
  const modal = document.getElementById('transactionModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('transactionForm');
  const typeBtns = document.querySelectorAll('.type-btn');

  if (title) {
    title.textContent = transaction ? 'Edit Transaksi' : 'Tambah Transaksi';
  }

  if (form) {
    form.reset();
  }

  const dateInput = document.getElementById('transactionDate');
  if (dateInput) {
    dateInput.value = formatDateInput(new Date());
  }

  if (transaction) {
    document.getElementById('transactionId').value = transaction.id;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('description').value = transaction.description;
    document.getElementById('transactionDate').value = transaction.date;

    currentType = transaction.type;
    typeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === currentType);
    });

    renderCategoryGrid(currentType, transaction.category);
  } else {
    document.getElementById('transactionId').value = '';
    currentType = 'income';
    typeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === 'income');
    });
    renderCategoryGrid('income');
  }

  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal() {
  const modal = document.getElementById('transactionModal');
  if (modal) {
    modal.classList.remove('active');
  }
  editingTransaction = null;
}

function handleTransactionSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;
  const date = document.getElementById('transactionDate').value;
  const selectedCategory = document.querySelector('.category-item.selected');

  const data = {
    type: currentType,
    amount,
    category: selectedCategory?.dataset.id,
    description,
    date
  };

  const validation = validateTransaction(data);

  if (!validation.isValid) {
    showToast(validation.errors[0], 'error');
    if (!amount || amount <= 0) {
      const amountInput = document.getElementById('amount');
      amountInput.classList.add('error');
      setTimeout(() => amountInput.classList.remove('error'), 500);
    }
    return;
  }

  if (editingTransaction) {
    updateTransaction(editingTransaction.id, data);
    showToast('Transaksi berhasil diupdate!', 'success');
  } else {
    addTransaction(data);
    showToast('Transaksi berhasil ditambahkan! 🎉', 'success');
  }

  closeModal();
  renderAll();
}

// ==================== BUDGET FORM ====================
function setupBudgetForm() {
  const addBudgetBtn = document.getElementById('addBudgetBtn');
  if (addBudgetBtn) {
    addBudgetBtn.addEventListener('click', handleAddBudget);
  }
}

function handleAddBudget() {
  const category = document.getElementById('budgetCategory').value;
  const limit = parseFloat(document.getElementById('budgetLimit').value);

  const validation = validateBudget({ category, limit });

  if (!validation.isValid) {
    showToast(validation.errors[0], 'error');
    return;
  }

  addBudget(category, limit);
  showToast('Budget berhasil ditambahkan! 🎯', 'success');

  document.getElementById('budgetCategory').value = '';
  document.getElementById('budgetLimit').value = '';

  renderBudgets();
}

// ==================== FILTERS ====================
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTransactionsList();
    });
  });
}

// ==================== SEARCH ====================
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value;
        searchClear.style.display = searchQuery ? 'flex' : 'none';
        renderTransactionsList();
      }, 300);
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      renderTransactionsList();
    });
  }
}

// ==================== EXPORT ====================
function setupExport() {
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
  }
}

function handleExport() {
  const transactions = getTransactionsByFilter(currentFilter);
  if (transactions.length === 0) {
    showToast('Tidak ada transaksi untuk di-export', 'error');
    return;
  }
  exportTransactionsToCSV(transactions);
  showToast('CSV berhasil di-download! 📥', 'success');
}

// ==================== IMPORT ====================
function setupImport() {
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
  const importFileInput = document.getElementById('importFileInput');

  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener('click', () => {
      downloadExcelTemplate();
      showToast('Template Excel berhasil di-download! 📊', 'success');
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', handleFileImport);
  }
}

async function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    showToast('Memproses file... ⏳', 'info');

    const { transactions, errors } = await parseExcelToTransactions(file);

    if (transactions.length === 0) {
      showToast('Tidak ada transaksi valid dalam file', 'error');
      return;
    }

    // Add all transactions
    transactions.forEach(t => addTransaction(t));

    // Show results
    let message = `${transactions.length} transaksi berhasil di-import! 🎉`;
    if (errors.length > 0) {
      message += ` (${errors.length} baris dilewati)`;
    }
    showToast(message, 'success');

    // Refresh the list
    renderAll();

    // Reset file input
    e.target.value = '';

  } catch (err) {
    showToast(err.message, 'error');
    console.error('Import error:', err);
  }
}

// ==================== CUSTOM EVENTS ====================
function setupCustomEvents() {
  // Edit transaction
  window.addEventListener('editTransaction', (e) => {
    const transaction = getTransactionById(e.detail.id);
    if (transaction) {
      openModal(transaction);
    }
  });

  // Transactions updated
  window.addEventListener('transactionsUpdated', () => {
    renderAll();
  });

  // Budget deleted
  window.deleteBudgetById = (id) => {
    if (confirm('Yakin mau hapus budget ini?')) {
      deleteBudget(id);
      showToast('Budget berhasil dihapus!', 'success');
      renderBudgets();
    }
  };
}

// ==================== RENDERING ====================
function renderAll() {
  renderTransactionsList();
  updateDashboard();
  renderBudgets();
  renderStats();
}

function renderTransactionsList() {
  const transactions = searchQuery
    ? searchTransactions(searchQuery, currentFilter)
    : getTransactionsByFilter(currentFilter);
  renderTransactions(transactions, 'recentTransactions');
  renderTransactions(transactions, 'allTransactions');
}

// ==================== EXPORTS ====================
export { openModal, closeModal };
