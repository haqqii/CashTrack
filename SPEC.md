# CashTrack - Website Pencatat Keuangan Gen Z Edition

## 1. Project Overview

**Project Name:** CashTrack
**Type:** Single Page Web Application (SPA)
**Core Functionality:** Personal finance tracker dengan UI yang catchy dan fun ala Gen Z, memungkinkan user mencatat transaksi pemasukan dan pengeluaran, melihat ringkasan keuangan, dan mengatur budget.
**Target Users:** Semua kalangan, dari mahasiswa hingga pekerja profesional yang ingin tracking keuangan dengan cara yang enjoyable.

---

## 2. Visual & Rendering Specification

### Design Philosophy: "Soft, Playful, But Serious About Money"

### Color Palette
- **Primary Gradient:** `#FF6B6B` (coral) → `#4ECDC4` (teal) - untuk headers dan CTAs
- **Secondary:** `#FFE66D` (soft yellow) - untuk highlights dan income indicators
- **Accent Dark:** `#2D3436` - untuk text dan containers
- **Background:** `#F8F9FA` (off-white) dengan subtle noise texture
- **Card Background:** `#FFFFFF` dengan soft shadow
- **Expense Color:** `#FF6B6B` (coral red)
- **Income Color:** `#4ECDC4` (teal green)
- **Neutral:** `#A29BFE` (soft purple) - untuk categories

### Typography
- **Headings:** "Plus Jakarta Sans" (Google Fonts) - Bold, playful but readable
- **Body:** "Inter" (Google Fonts) - Clean, modern sans-serif
- **Accent/Numbers:** "Space Grotesk" (Google Fonts) - untuk balance dan angka besar

### Layout
- **Container:** Max-width 1200px, centered
- **Border Radius:** 16px untuk cards, 12px untuk buttons, 24px untuk modals
- **Spacing System:** 8px base unit (8, 16, 24, 32, 48, 64)
- **Shadows:** Soft, diffused shadows - `0 8px 32px rgba(0,0,0,0.08)`

### Visual Effects
- **Glassmorphism:** Semi-transparent cards dengan blur backdrop
- **Gradients:** Linear gradients untuk accent elements
- **Animations:**
  - Subtle bounce on hover (transform: scale(1.02))
  - Smooth slide-in for new transactions
  - Pulse animation untuk positive balance
  - Shake animation untuk form errors
- **Icons:** Lucide Icons - rounded, friendly style

---

## 3. Application Structure

### Main Sections
1. **Header/Navigation**
   - Logo "CashTrack" dengan animated coin icon
   - Navigation tabs: Dashboard | Transaksi | Budget | Statistik
   - Theme toggle (light/dark)

2. **Dashboard View**
   - Hero card: Total Balance dengan animasi pulse
   - Quick stats: Total Income | Total Expense | Savings Rate
   - Recent transactions (5 terakhir)
   - Monthly trend mini chart

3. **Transaction View**
   - Add transaction form (slide-down)
   - Filter: All | Income | Expense
   - Sort by: Date | Amount | Category
   - Transaction list dengan kategori icons
   - Pagination atau infinite scroll

4. **Budget View**
   - Budget categories dengan progress bars
   - Remaining vs spent visualization
   - Add/edit budget categories

5. **Statistics View**
   - Monthly overview chart (bar chart)
   - Category breakdown (donut chart)
   - Income vs Expense trend line
   - Savings rate over time

### Components

#### Transaction Card
- Category icon dengan colored background
- Description text
- Amount (colored based on type)
- Date dan time
- Delete/Edit actions on hover

#### Add Transaction Modal
- Type toggle: Income / Expense
- Amount input dengan currency formatting
- Category selector (grid of icons)
- Description input
- Date picker
- Submit button dengan loading state

#### Budget Card
- Category name dan icon
- Progress bar dengan gradient fill
- Spent / Total amount
- Remaining amount
- Edit/Delete actions

#### Stat Card
- Icon dengan gradient background
- Label text
- Large value display
- Trend indicator (up/down arrow)

---

## 4. Data Categories

### Income Categories
- 💼 Gaji
- 🎁 Hadiah
- 💰 Freelance
- 📈 Investasi
- 🏆 Bonus
- 🔄 Lainnya

### Expense Categories
- 🍔 Makanan & Minuman
- 🚗 Transportasi
- 🛒 Belanja
- 🎮 Hiburan
- 💊 Kesehatan
- 📚 Pendidikan
- 🏠 Rumah
- 📱 Tagihan & Langganan
- 🎁 Hadiah & Donasi
- 🔄 Lainnya

---

## 5. Functionality Specification

### Core Features

1. **Add Transaction**
   - Input: type, amount, category, description, date
   - Validation: amount > 0, category required
   - Auto-save to localStorage
   - Success feedback animation

2. **View Transactions**
   - List semua transaksi dengan infinite scroll
   - Filter by type (income/expense)
   - Search by description
   - Sort by date/amount

3. **Edit Transaction**
   - Click to edit inline atau modal
   - Pre-filled form
   - Update localStorage

4. **Delete Transaction**
   - Swipe to delete atau delete button
   - Confirmation dialog
   - Undo option (toast notification)

5. **Budget Management**
   - Set monthly budget per category
   - Track spending against budget
   - Visual progress indicators
   - Alerts when approaching limit (80%)

6. **Statistics & Analytics**
   - Monthly spending breakdown
   - Category distribution
   - Savings rate calculation
   - Comparison with previous month

7. **Data Persistence**
   - localStorage untuk semua data
   - Export to CSV
   - Clear all data option

### Interactions
- **Hover:** Scale up 1.02, shadow increase
- **Click:** Ripple effect, slight press down
- **Submit:** Button loading state, success checkmark
- **Error:** Shake animation, red border
- **Delete:** Slide out animation

---

## 6. Technical Implementation

### Stack
- **HTML5** - Semantic structure
- **CSS3** - Custom properties, Flexbox, Grid, Animations
- **Vanilla JavaScript** - ES6+, modular structure
- **No frameworks** - Keep it simple dan fast

### File Structure
```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js (main entry)
│   ├── modules/
│   │   ├── storage.js (localStorage handling)
│   │   ├── transactions.js (CRUD operations)
│   │   ├── budget.js (budget management)
│   │   ├── stats.js (statistics calculations)
│   │   └── ui.js (DOM manipulation)
│   └── utils/
│       ├── format.js (currency, date formatting)
│       └── validators.js
└── assets/
    └── (optional images)
```

### Data Model
```javascript
Transaction {
  id: string (UUID),
  type: 'income' | 'expense',
  amount: number,
  category: string,
  description: string,
  date: string (ISO format),
  createdAt: timestamp
}

Budget {
  id: string (UUID),
  category: string,
  limit: number,
  month: string (YYYY-MM)
}
```

---

## 7. Acceptance Criteria

1. ✅ User dapat menambah transaksi income/expense
2. ✅ User dapat melihat daftar transaksi dengan filter
3. ✅ User dapat edit dan delete transaksi
4. ✅ Dashboard menampilkan balance, income, expense summary
5. ✅ Budget tracking dengan visual progress
6. ✅ Statistik dengan chart sederhana
7. ✅ Data tersimpan di localStorage
8. ✅ UI responsive untuk mobile dan desktop
9. ✅ Animasi smooth pada semua interaksi
10. ✅ Semua form ter-validasi dengan feedback
11. ✅ Dark mode toggle berfungsi
12. ✅ Konsep Gen Z UI: playful, colorful, modern
13. ✅ Search transaksi by deskripsi dan kategori
14. ✅ Export transaksi ke file CSV
15. ✅ Download template Excel untuk import
16. ✅ Import transaksi dari file Excel/CSV

---

## 8. Out of Scope (v1.0)

- Multi-user / Authentication
- Cloud sync
- Real-time notifications
- Print to PDF report
- Currency conversion
- Recurring transactions
- Investment portfolio tracking
