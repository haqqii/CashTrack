const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // Open directly from file://
  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  console.log('Loading:', filePath);

  await page.goto(filePath, { waitUntil: 'networkidle' });

  console.log('\n=== Testing Direct File Open ===');

  // Check if app loaded
  const title = await page.title();
  console.log('Page title:', title);

  // Check if main elements exist
  const logo = await page.$('.logo');
  console.log('Logo found:', !!logo);

  const heroCard = await page.$('.hero-card');
  console.log('Hero card found:', !!heroCard);

  // Test navigation
  console.log('\n=== Testing Navigation ===');
  const transTab = await page.$('.nav-tab[data-view="transactions"]');
  await transTab.click();
  await page.waitForTimeout(500);

  const transViewActive = await page.$('#transactions-view.active');
  console.log('Transactions view active after click:', !!transViewActive);

  // Test budget view
  const budgetTab = await page.$('.nav-tab[data-view="budget"]');
  await budgetTab.click();
  await page.waitForTimeout(500);

  const budgetViewActive = await page.$('#budget-view.active');
  console.log('Budget view active after click:', !!budgetViewActive);

  // Test stats view
  const statsTab = await page.$('.nav-tab[data-view="stats"]');
  await statsTab.click();
  await page.waitForTimeout(500);

  const statsViewActive = await page.$('#stats-view.active');
  console.log('Stats view active after click:', !!statsViewActive);

  // Test add transaction
  console.log('\n=== Testing Add Transaction ===');
  const dashboardTab = await page.$('.nav-tab[data-view="dashboard"]');
  await dashboardTab.click();
  await page.waitForTimeout(300);

  const addBtn = await page.$('#addTransBtn');
  await addBtn.click();
  await page.waitForTimeout(500);

  const modal = await page.$('.modal-overlay.active');
  console.log('Modal opens:', !!modal);

  if (errors.length > 0) {
    console.log('\nErrors found:');
    errors.forEach(e => console.log('  -', e));
  } else {
    console.log('\nAll tests passed! No errors found!');
  }

  await browser.close();

  process.exit(errors.length > 0 ? 1 : 0);
})();
