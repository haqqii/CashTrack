/**
 * Form validation utilities
 */

export function validateAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

export function validateCategory(category) {
  return category && category.trim().length > 0;
}

export function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function validateTransaction(data) {
  const errors = [];

  if (!validateAmount(data.amount)) {
    errors.push('Jumlah harus lebih dari 0');
  }

  if (!validateCategory(data.category)) {
    errors.push('Pilih kategori');
  }

  if (!validateDate(data.date)) {
    errors.push('Tanggal tidak valid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBudget(data) {
  const errors = [];

  if (!validateCategory(data.category)) {
    errors.push('Pilih kategori');
  }

  if (!validateAmount(data.limit)) {
    errors.push('Limit budget harus lebih dari 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
