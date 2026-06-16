# CashTrack - Personal Finance Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

A modern, Gen Z-styled personal finance tracker web application. Track your income, expenses, budgets, and analyze your spending patterns with a playful and intuitive UI.

![CashTrack Preview](https://via.placeholder.com/800x400?text=CashTrack+Finance+Tracker)

## Features

### Core Features
- **Dashboard** - Overview of total balance, income, expenses, and savings rate
- **Transactions** - Add, edit, delete, search, and filter transactions
- **Budget** - Set monthly spending limits per category with visual progress bars
- **Statistics** - Monthly income vs expense charts and category breakdown

### Import/Export
- **Export to CSV** - Download all transactions as a CSV file
- **Import from Excel** - Upload transactions from Excel (.xlsx) or CSV files
- **Excel Template** - Download pre-formatted template for easy data entry

### UI/UX
- **Gen Z Design** - Playful, colorful, and modern interface
- **Dark Mode** - Toggle between light and dark themes
- **Responsive** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Bounce, slide, and pulse animations
- **Toast Notifications** - Feedback for all actions

## Quick Start

### Option 1: Direct Open (Recommended)
Simply open `index.html` in any modern browser:
```
index.html
```

### Option 2: Local Server
```bash
# Using npx
npx http-server -p 8080

# Using Python
python -m http.server 8080

# Then open http://localhost:8080
```

## Usage

### Adding a Transaction
1. Click the **+ Tambah** button
2. Select **Pemasukan** (income) or **Pengeluaran** (expense)
3. Enter the amount
4. Select a category
5. Add a description (optional)
6. Set the date
7. Click **Simpan**

### Importing from Excel
1. Click **Template** button to download the Excel template
2. Fill in the template with your transactions
3. Click **Import** button
4. Select your Excel file
5. Transactions will be automatically imported

### Exporting Data
1. Go to the **Transaksi** tab
2. Click **Export** button
3. CSV file will be downloaded automatically

## Categories

### Income Categories
| Category | Icon |
|----------|------|
| Gaji (Salary) | 💼 |
| Hadiah (Gift) | 🎁 |
| Freelance | 💰 |
| Investasi (Investment) | 📈 |
| Bonus | 🏆 |
| Lainnya (Other) | 🔄 |

### Expense Categories
| Category | Icon |
|----------|------|
| Makanan (Food) | 🍔 |
| Transport | 🚗 |
| Belanja (Shopping) | 🛒 |
| Hiburan (Entertainment) | 🎮 |
| Kesehatan (Health) | 💊 |
| Pendidikan (Education) | 📚 |
| Rumah (Home) | 🏠 |
| Tagihan (Bills) | 📱 |
| Hadiah (Gifts) | 🎁 |
| Lainnya (Other) | 🔄 |

## File Structure

```
├── index.html           # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── bundle.js       # Bundled JS (for direct file open)
│   ├── app.js          # Main entry point (ES modules)
│   └── modules/        # ES modules
│       ├── storage.js
│       ├── transactions.js
│       ├── budget.js
│       ├── stats.js
│       └── ui.js
├── assets/
│   └── template_import.js
├── SPEC.md             # Project specification
└── README.md
```

## Data Storage

All data is stored locally in the browser using **localStorage**:
- `cashtrack_transactions` - All transactions
- `cashtrack_budgets` - Budget settings
- `cashtrack_theme` - Theme preference

> **Note:** Data is stored locally and will be cleared if you clear your browser cache. Consider exporting your data regularly.

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, Animations
- **JavaScript** - Vanilla ES6+
- **SheetJS (xlsx)** - Excel file parsing
- **Google Fonts** - Plus Jakarta Sans, Inter, Space Grotesk

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by Gen Z aesthetics
- Icons from native emoji set
- Fonts from Google Fonts

---

Made with ❤️ for better financial management
