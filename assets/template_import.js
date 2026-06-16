/**
 * SheetJS Excel Template Generator
 * Creates a downloadable Excel template for importing transactions
 */

export function downloadExcelTemplate() {
  // SheetJS will be loaded from CDN
  if (typeof XLSX === 'undefined') {
    console.error('SheetJS library not loaded');
    return;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();

  // === SHEET 1: Template ===
  const templateData = [
    // Header row
    ['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah'],
    // Example rows
    ['2024-01-15', 'Pemasukan', 'Gaji', 'Gaji bulanan Januari', 15000000],
    ['2024-01-16', 'Pengeluaran', 'Makanan', 'Makan siang kantor', 50000],
    ['2024-01-17', 'Pengeluaran', 'Transport', 'Grab ke meeting', 25000],
    ['2024-01-18', 'Pemasukan', 'Freelance', 'Project website client A', 5000000],
    ['2024-01-19', 'Pengeluaran', 'Belanja', 'Belanja mingguan', 300000],
    // Empty rows for user to fill
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Tanggal
    { wch: 12 },  // Jenis
    { wch: 20 },  // Kategori
    { wch: 35 },  // Deskripsi
    { wch: 15 },  // Jumlah
  ];

  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // === SHEET 2: Kategori Reference ===
  const categoryData = [
    ['KATEGORI PENGELUARAN', '', 'KATEGORI PEMASUKAN', ''],
    ['Kategori', 'Icon', 'Kategori', 'Icon'],
    ['Makanan', '🍔', 'Gaji', '💼'],
    ['Transport', '🚗', 'Hadiah', '🎁'],
    ['Belanja', '🛒', 'Freelance', '💰'],
    ['Hiburan', '🎮', 'Investasi', '📈'],
    ['Kesehatan', '💊', 'Bonus', '🏆'],
    ['Pendidikan', '📚', 'Lainnya', '🔄'],
    ['Rumah', '🏠', '', ''],
    ['Tagihan', '📱', '', ''],
    ['Hadiah', '🎁', '', ''],
    ['Lainnya', '🔄', '', ''],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
  ws2['!cols'] = [
    { wch: 15 },
    { wch: 8 },
    { wch: 15 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Referensi Kategori');

  // === SHEET 3: Instructions ===
  const instructionData = [
    ['CARA MENGGUNAKAN TEMPLATE INI'],
    [''],
    ['1. Isi data mulai dari baris 2 (baris 1 adalah header)'],
    ['2. Kolom Tanggal: format YYYY-MM-DD (contoh: 2024-01-15)'],
    ['3. Kolom Jenis: tulis "Pemasukan" atau "Pengeluaran" (huruf kecil/besar tidak masalah)'],
    ['4. Kolom Kategori: gunakan nama kategori sesuai daftar di sheet "Referensi Kategori"'],
    ['5. Kolom Deskripsi: opsional, boleh kosong'],
    ['6. Kolom Jumlah: angka tanpa titik atau koma (contoh: 50000)'],
    [''],
    ['CONTOH:'],
    ['Tanggal       | Jenis         | Kategori  | Deskripsi                | Jumlah'],
    ['2024-01-15   | Pemasukan     | Gaji      | Gaji bulanan             | 15000000'],
    ['2024-01-16   | Pengeluaran    | Makanan   | Makan siang              | 50000'],
    [''],
    ['TIPS:'],
    ['- Jangan ubah nama kolom di baris 1'],
    ['- Tanggal harus menggunakan format: YYYY-MM-DD'],
    ['- Untuk desimal gunakan titik (contoh: 50000.50)'],
    ['- Hapus baris contoh sebelum import jika tidak diperlukan'],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(instructionData);
  ws3['!cols'] = [
    { wch: 80 },
  ];

  XLSX.utils.book_append_sheet(wb, ws3, 'Petunjuk');

  // Download the file
  XLSX.writeFile(wb, 'cashtrack_template.xlsx');
}

/**
 * Parse Excel file and convert to transactions array
 */
export function parseExcelToTransactions(file) {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') {
      reject(new Error('SheetJS library not loaded'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Parse rows (skip header row)
        const transactions = [];
        const errors = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0 || !row[0]) continue;

          try {
            const transaction = parseRow(row, i + 1);
            if (transaction) {
              transactions.push(transaction);
            }
          } catch (err) {
            errors.push(`Baris ${i + 1}: ${err.message}`);
          }
        }

        resolve({ transactions, errors });
      } catch (err) {
        reject(new Error('Gagal membaca file Excel: ' + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

function parseRow(row, rowNumber) {
  // Expected columns: Tanggal, Jenis, Kategori, Deskripsi, Jumlah
  const [date, type, category, description, amount] = row;

  // Validate required fields
  if (!date) {
    throw new Error('Tanggal kosong');
  }

  if (!type) {
    throw new Error('Jenis kosong');
  }

  if (!category) {
    throw new Error('Kategori kosong');
  }

  if (!amount || isNaN(parseFloat(amount))) {
    throw new Error('Jumlah tidak valid');
  }

  // Normalize type
  const normalizedType = type.toString().toLowerCase().trim();
  let finalType;

  if (normalizedType.includes('masuk') || normalizedType === 'income') {
    finalType = 'income';
  } else if (normalizedType.includes('keluar') || normalizedType === 'expense') {
    finalType = 'expense';
  } else {
    throw new Error(`Jenis "${type}" tidak valid. Gunakan "Pemasukan" atau "Pengeluaran"`);
  }

  // Normalize category
  const normalizedCategory = category.toString().toLowerCase().trim();
  const finalCategory = normalizeCategory(normalizedCategory, finalType);

  // Parse date
  let parsedDate;
  if (typeof date === 'number') {
    // Excel date serial number
    const dateObj = new Date((date - 25569) * 86400 * 1000);
    parsedDate = dateObj.toISOString().split('T')[0];
  } else {
    // String date (try to parse)
    const dateStr = date.toString().trim();
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Format tanggal "${date}" tidak valid. Gunakan YYYY-MM-DD`);
    }
    parsedDate = parsed.toISOString().split('T')[0];
  }

  return {
    type: finalType,
    amount: Math.abs(parseFloat(amount)),
    category: finalCategory,
    description: description?.toString().trim() || '',
    date: parsedDate
  };
}

function normalizeCategory(categoryName, type) {
  // Category name mappings
  const categoryMap = {
    // Expense categories
    'makanan': 'food',
    'makan': 'food',
    'food': 'food',
    'transport': 'transport',
    'transportasi': 'transport',
    'transportation': 'transport',
    'belanja': 'shopping',
    'belanjam': 'shopping',
    'shopping': 'shopping',
    'hiburan': 'entertainment',
    'entertainment': 'entertainment',
    'game': 'entertainment',
    'kesehatan': 'health',
    'health': 'health',
    'obat': 'health',
    'pendidikan': 'education',
    'education': 'education',
    'sekolah': 'education',
    'kursus': 'education',
    'rumah': 'home',
    'home': 'home',
    'tagihan': 'bills',
    'bills': 'bills',
    'langganan': 'bills',
    'hadiah': 'gifts',
    'gift': 'gifts',
    'donasi': 'gifts',
    'lainnya': 'other-out',
    'other': 'other-out',
    'lain': 'other-out',

    // Income categories
    'gaji': 'salary',
    'salary': 'salary',
    'upah': 'salary',
    'hadiah': 'gift',
    'gift': 'gift',
    'freelance': 'freelance',
    'freelancer': 'freelance',
    'kerja': 'freelance',
    'investasi': 'investment',
    'investment': 'investment',
    'return': 'investment',
    'bonus': 'bonus',
    'insentif': 'bonus',
    'thr': 'bonus',
    'other-in': 'other-in',
    'otherin': 'other-in',
    'pemasukan lain': 'other-in',
  };

  const normalized = categoryMap[categoryName];
  if (normalized) {
    return normalized;
  }

  // Check if category exists in our categories
  const categories = type === 'income'
    ? ['salary', 'gift', 'freelance', 'investment', 'bonus', 'other-in']
    : ['food', 'transport', 'shopping', 'entertainment', 'health', 'education', 'home', 'bills', 'gifts', 'other-out'];

  // Try exact match
  for (const cat of categories) {
    if (categoryName === cat) {
      return cat;
    }
  }

  // Default fallback
  return type === 'income' ? 'other-in' : 'other-out';
}
