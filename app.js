/* Diabetes Diary PWA (module) */

import { get, set, update } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

const TARGET_GLUCOSE = 7; // ммоль/л
const ISF = 2; // ммоль/л снижается 1 ед ins

const form = document.getElementById('entry-form');
const recDiv = document.getElementById('recommendation');
// tableBody no longer used

// product related elements
const groupSelect = document.getElementById('group');
const productSelect = document.getElementById('product');
const addProductBtn = document.getElementById('add-product');
const gramsInput = document.getElementById('grams');
const carbsInput = document.getElementById('carbs');
const addItemBtn = document.getElementById('add-item');
const itemsListElem = document.getElementById('items-list');
const historyContainer = document.getElementById('history-container');
const filterDateInput = document.getElementById('filter-date');
const clearTodayBtn = document.getElementById('clear-today');

// список добавленных позицій поточного прийому
let currentItems = [];

// Установить сегодняшнюю дату по умолчанию
document.getElementById('date').valueAsDate = new Date();

// Додаю динамічне наповнення select#meal
const mealSelect = document.getElementById('meal');
if (mealSelect) {
  const mealOptions = [
    { value: 'Завтрак', label: 'Сніданок' },
    { value: 'Перекус', label: 'Перекус' },
    { value: 'Обед', label: 'Обід' },
    { value: 'Полдник', label: 'Полуденок' },
    { value: 'Ужин', label: 'Вечеря' },
    { value: 'Поздний перекус', label: 'Пізній перекус' }
  ];
  mealSelect.innerHTML = mealOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
}

// ---------------------- Products ----------------------
const PRODUCT_GROUPS = [
  {
    group: 'Зернові, злакові, вироби з борошна',
    products: [
      { name: 'Хліб чорний', gramsPerHO: 25 },
      { name: 'Хліб бородинський', gramsPerHO: 15 },
      { name: 'Хрусткі хлібці', gramsPerHO: 20 },
      { name: 'Хлібні палички', gramsPerHO: 20 },
      { name: 'Бублики несолодкі', gramsPerHO: 20 },
      { name: 'Лаваш', gramsPerHO: 20 },
      { name: 'Млинці з сиром заморожені', gramsPerHO: 50 },
      { name: 'Млинці з м\'ясом заморожені', gramsPerHO: 50 },
      { name: 'Пряник', gramsPerHO: 40 },
      { name: 'Вафлі дрібні', gramsPerHO: 17 },
      { name: 'Оладки', gramsPerHO: 30 },
      { name: 'Печиво вершкове', gramsPerHO: 15 },
      { name: 'Варені макарони', gramsPerHO: 50 },
    ]
  },
  {
    group: 'Картопля, стиглі бобові, овочі',
    products: [
      { name: 'Горошок консервований', gramsPerHO: 100 },
      { name: 'Картопля в мундирі', gramsPerHO: 75 },
      { name: 'Картопляне пюре', gramsPerHO: 75 },
      { name: 'Картопля смажена', gramsPerHO: 35 },
      { name: 'Картопля фрі', gramsPerHO: 35 },
      { name: 'Картопляні чіпси', gramsPerHO: 25 },
      { name: 'Кукурудза консервована', gramsPerHO: 70 },
      { name: 'Капуста кисла', gramsPerHO: 400 },
      { name: 'Огірки', gramsPerHO: 800 },
    ]
  },
  {
    group: 'Молочні продукти',
    products: [
      { name: 'Молоко', gramsPerHO: 200 },
      { name: 'Кефір', gramsPerHO: 250 },
      { name: 'Йогурт фруктовий', gramsPerHO: 75 },
      { name: 'Морозиво молочне (без глазурі і вафлі)', gramsPerHO: 65 },
      { name: 'Морозиво молочне (в глазурі або вафлях)', gramsPerHO: 50 },
      { name: 'Сирна маса солодка', gramsPerHO: 100 },
      { name: 'Дитячі сирки глазуровані', gramsPerHO: 35 },
    ]
  },
  {
    group: 'Фрукти та ягоди',
    products: [
      { name: 'Кавун', gramsPerHO: 270 },
      { name: 'Банан середній', gramsPerHO: 70 },
      { name: 'Виноград середній', gramsPerHO: 70 },
      { name: 'Вишня велика', gramsPerHO: 90 },
      { name: 'Грейпфрут великий', gramsPerHO: 170 },
      { name: 'Груша середня', gramsPerHO: 100 },
      { name: 'Диня', gramsPerHO: 100 },
      { name: 'Полуниця середня', gramsPerHO: 150 },
      { name: 'Малина', gramsPerHO: 150 },
      { name: 'Мандарини дрібні', gramsPerHO: 120 },
      { name: 'Персик середній', gramsPerHO: 120 },
      { name: 'Смородина', gramsPerHO: 140 },
      { name: 'Хурма середня', gramsPerHO: 70 },
      { name: 'Черешня', gramsPerHO: 100 },
      { name: 'Яблуко середнє будь-якого кольору', gramsPerHO: 90 },
    ]
  },
  {
    group: 'Соки натуральні',
    products: [
      { name: 'Томатний сік', gramsPerHO: 300 },
    ]
  },
  {
    group: 'Напої',
    products: [
      { name: 'Пепсі', gramsPerHO: 100 },
      { name: 'Квас', gramsPerHO: 250 },
      { name: 'Компот', gramsPerHO: 250 },
      { name: 'Пиво світле', gramsPerHO: 300 },
    ]
  },
  {
    group: 'Готові продукти',
    products: [
      { name: 'Ковбаса варена, сосиски', gramsPerHO: 100 },
      { name: 'Суп домашній', gramsPerHO: 62.5 },
      { name: 'Борщ домашній', gramsPerHO: 62.5 },
      { name: 'Торт кусок', gramsPerHO: 25 },
    ]
  },
  {
    group: 'Горіхи',
    products: [
      { name: 'Фісташки', gramsPerHO: 60 },
    ]
  },
];

// Заповнює select з групами продуктів
function populateGroupSelect() {
  groupSelect.innerHTML = '';
  PRODUCT_GROUPS.forEach((g, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = g.group;
    groupSelect.appendChild(opt);
  });
}

// Заповнює select з продуктами для вибраної групи
function populateProductSelect() {
  const groupIdx = parseInt(groupSelect.value);
  productSelect.innerHTML = '';
  if (isNaN(groupIdx)) return;
  PRODUCT_GROUPS[groupIdx].products.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = p.name;
    productSelect.appendChild(opt);
  });
}

groupSelect.addEventListener('change', () => {
  populateProductSelect();
  computeCarbs();
});
productSelect.addEventListener('change', computeCarbs);
gramsInput.addEventListener('input', computeCarbs);

// ініціалізація при завантаженні сторінки
populateGroupSelect();
groupSelect.value = 0;
populateProductSelect();

// Розраховує кількість ХО для вибраного продукту і ваги
function computeCarbs() {
  const grams = parseFloat(gramsInput.value);
  const groupIdx = parseInt(groupSelect.value);
  const prodIdx = parseInt(productSelect.value);
  if (isNaN(grams) || grams <= 0 || isNaN(groupIdx) || isNaN(prodIdx)) {
    carbsInput.value = '';
    return 0;
  }
  const product = PRODUCT_GROUPS[groupIdx].products[prodIdx];
  let he = 0;
  if (product.gramsPerHO > 0) {
    he = grams / product.gramsPerHO;
    carbsInput.value = he.toFixed(2);
    return he;
  } else if (product.hoPerPortion) {
    // для страв із МакДональдз
    const portions = grams > 0 ? grams : 1;
    carbsInput.value = (product.hoPerPortion * portions).toFixed(2);
    return product.hoPerPortion * portions;
  } else {
    carbsInput.value = '0';
    return 0;
  }
}

// кнопка добавления нового продукта в справочник
addProductBtn.addEventListener('click', () => {
  const groupIdx = parseInt(groupSelect.value);
  if (isNaN(groupIdx) || !PRODUCT_GROUPS[groupIdx]) {
    alert('Оберіть групу продуктів!');
    return;
  }
  const name = prompt('Назва продукту?');
  if (!name) return;
  const gramsStr = prompt('Скільки грамів продукту = 1 ХО? (наприклад, 250 для молока)');
  const gramsPerHO = parseFloat(gramsStr);
  if (isNaN(gramsPerHO) || gramsPerHO <= 0) {
    alert('Вкажіть коректну кількість грамів на 1 ХО!');
    return;
  }
  PRODUCT_GROUPS[groupIdx].products.push({ name, gramsPerHO });
  // Якщо є збереження у IndexedDB — додати saveProducts(PRODUCT_GROUPS);
  populateProductSelect();
  productSelect.value = PRODUCT_GROUPS[groupIdx].products.length - 1;
  computeCarbs();
});

// Рендерить список продуктів у поточному прийомі їжі
function renderItemsList() {
  itemsListElem.innerHTML = '';
  currentItems.forEach((item, idx) => {
    const li = document.createElement('li');
    li.textContent = `${item.name} — ${item.grams} г (${item.he.toFixed(1)} ХО)`;
    li.style.cursor = 'pointer';
    li.title = 'Нажмите, чтобы удалить';
    li.addEventListener('click', () => {
      currentItems.splice(idx, 1);
      updateCarbsField();
      renderItemsList();
    });
    itemsListElem.appendChild(li);
  });
}

// Оновлює поле ХО на основі поточного списку продуктів
function updateCarbsField() {
  const totalHe = currentItems.reduce((sum, it) => sum + it.he, 0);
  carbsInput.value = totalHe.toFixed(1);
  return totalHe;
}

addItemBtn.addEventListener('click', () => {
  const grams = parseFloat(gramsInput.value);
  const groupIdx = parseInt(groupSelect.value);
  const prodIdx = parseInt(productSelect.value);
  if (isNaN(grams) || grams <= 0 || isNaN(groupIdx) || isNaN(prodIdx)) {
    alert('Введіть продукт та грами');
    return;
  }
  const product = PRODUCT_GROUPS[groupIdx].products[prodIdx];
  let he = 0;
  if (product.gramsPerHO > 0) {
    he = grams / product.gramsPerHO;
  } else {
    he = 0;
  }
  currentItems.push({ name: product.name, grams, he });
  renderItemsList();
  updateCarbsField();
  gramsInput.value = '';
});

// Коефіцієнти для різних прийомів їжі
const MEAL_RATIOS = {
  'Завтрак': 2,
  'Обед': 1.5,
  'Ужин': 1,
  'Перекус': 1.5,
  'Полдник': 1.5,
  'Поздний перекус': 1.5
};

// Розраховує рекомендовану дозу інсуліну
function calculateRecommendation(glucose, carbs, meal) {
  const ratio = MEAL_RATIOS[meal] || 1;
  const foodDose = carbs * ratio;
  const correctionDose = (glucose - TARGET_GLUCOSE) / ISF;
  const total = foodDose + correctionDose;
  return Math.max(0, Math.round(total));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const meal = document.getElementById('meal').value;
  const time = document.getElementById('time').value;
  const glucose = parseFloat(document.getElementById('glucose').value);
  const groupIdx = parseInt(groupSelect.value);
  const prodIdx = parseInt(productSelect.value);
  const product = PRODUCT_GROUPS[groupIdx].products[prodIdx];
  const productName = product ? product.name : '';
  const grams = parseFloat(gramsInput.value);
  // якщо юзер не натиснув "додати" і ввів одиночну позицію
  if (!isNaN(grams) && grams > 0) {
    const heSingle = computeCarbs();
    currentItems.push({ name: productName, grams, he: heSingle });
    renderItemsList();
  }

  const carbs = updateCarbsField();

  if (!time) {
    alert('Вкажіть час.');
    return;
  }

  const recDose = calculateRecommendation(glucose, carbs, meal);
  recDiv.classList.remove('hidden');
  const mealLabel = {
    'Завтрак': 'Сніданок',
    'Обед': 'Обід',
    'Ужин': 'Вечеря',
    'Перекус': 'Перекус',
    'Полдник': 'Полуденок',
    'Поздний перекус': 'Пізній перекус'
  }[meal] || meal;
  const ratio = MEAL_RATIOS[meal] || 1;
  recDiv.textContent = `Рекомендована доза Apidra: ${recDose} од. (${mealLabel}, коеф. ${ratio})`;

  const entry = { date, meal, time, items: currentItems.slice(), glucose, carbs: carbs.toFixed(1), recommendation: recDose };
  await saveEntryToHistory(entry);
  await afterSave();
  form.reset();
  groupSelect.selectedIndex = 0;
  populateProductSelect();
  productSelect.selectedIndex = 0;
  gramsInput.value = '';
  carbsInput.value = '';
  currentItems = [];
  renderItemsList();
  // скинути дату на сьогодні
  document.getElementById('date').valueAsDate = new Date();
  populateProductSelect();
});

// Service Worker регистрация
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

// === Нові селектори року і місяця ===
const chartCanvas = document.getElementById('chart');
const exportCsvBtn = document.getElementById('export-csv');
const exportPdfBtn = document.getElementById('export-pdf');
const yearSelect = document.getElementById('select-year');
const monthSelect = document.getElementById('select-month');

// Повертає масив років, які є у записах
function getAllYears(entries) {
  const years = new Set(entries.map(e => new Date(e.date).getFullYear()));
  const arr = Array.from(years).sort((a, b) => b - a);
  return arr;
}

// Заповнює select з роками для фільтрації
function populateYearSelect(entries) {
  let years = getAllYears(entries);
  if (years.length === 0) {
    years = [new Date().getFullYear()];
  }
  yearSelect.innerHTML = '';
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
}

// Повертає обраний рік і місяць з select-елементів
function getSelectedYearMonth() {
  const year = parseInt(yearSelect.value);
  const month = monthSelect.value;
  return { year, month };
}

// Фільтрує записи за роком і місяцем
function filterEntriesByYearMonth(entries, year, month) {
  return entries.filter(e => {
    const d = new Date(e.date);
    if (d.getFullYear() !== year) return false;
    if (month === 'all') return true;
    return d.getMonth() === parseInt(month);
  });
}

// Рендерить графік за вибраний рік/місяць
async function renderChart() {
  if (!chartCanvas || !yearSelect || !monthSelect) return;
  const entries = await getEntries();
  if (!entries.length) return;
  populateYearSelect(entries);
  // Вибір поточного року/місяця за замовчуванням
  if (!yearSelect.value) {
    yearSelect.value = new Date().getFullYear();
  }
  if (!monthSelect.value) {
    monthSelect.value = String(new Date().getMonth());
  }
  const { year, month } = getSelectedYearMonth();
  const filtered = filterEntriesByYearMonth(entries, year, month);
  filtered.sort((a, b) => {
    const d1 = new Date(a.date + 'T' + (a.time || '00:00'));
    const d2 = new Date(b.date + 'T' + (b.time || '00:00'));
    return d1 - d2;
  });
  const labels = filtered.map(e => (e.date + (e.time ? ' ' + e.time : '')));
  const glucose = filtered.map(e => e.glucose);
  const insulin = filtered.map(e => e.recommendation);
  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Глюкоза (ммоль/л)',
          data: glucose,
          borderColor: '#e53935',
          backgroundColor: 'rgba(229,57,53,0.1)',
          yAxisID: 'y',
          tension: 0.2,
          pointRadius: 3,
          fill: false,
        },
        {
          type: 'bar',
          label: 'Apidra (од.)',
          data: insulin,
          backgroundColor: '#1976d2',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Глюкоза (ммоль/л)' },
          min: 0
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Apidra (од.)' },
          min: 0,
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}
if (yearSelect && monthSelect) {
  yearSelect.addEventListener('change', renderChart);
  monthSelect.addEventListener('change', renderChart);
  renderChart();
}

// === Експорт CSV/PDF для нового фільтра ===
if (exportCsvBtn) exportCsvBtn.addEventListener('click', async () => {
  const entries = await getEntries();
  const { year, month } = getSelectedYearMonth();
  const filtered = filterEntriesByYearMonth(entries, year, month);
  exportHistoryCsv(filtered);
});
if (exportPdfBtn) exportPdfBtn.addEventListener('click', async () => {
  const entries = await getEntries();
  const { year, month } = getSelectedYearMonth();
  const filtered = filterEntriesByYearMonth(entries, year, month);
  exportHistoryPdf(filtered);
});

// === Темна тема ===
const themeToggle = document.getElementById('theme-toggle');
// Встановлює тему (світла/темна)
function setTheme(dark) {
  document.documentElement.classList.toggle('dark-theme', dark);
  if (themeToggle) themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
// Визначає, чи система у темній темі
function detectSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
// Ініціалізує тему при старті
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    setTheme(true);
  } else if (saved === 'light') {
    setTheme(false);
  } else {
    const systemPrefersDark = detectSystemTheme();
    setTheme(systemPrefersDark);
  }
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark-theme');
    setTheme(!isDark);
  });
}
initTheme();

// === Збереження та отримання історії у IndexedDB ===
// Зберігає запис у IndexedDB
async function saveEntryToHistory(entry) {
  const history = await get('history') || [];
  history.push(entry);
  await set('history', history);
}

// Отримує всі записи з IndexedDB
async function getEntries() {
  return await get('history') || [];
}

// Отримує записи за останні 7 днів
async function getHistoryLast7Days() {
  const history = await get('history') || [];
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  return history.filter(e => {
    const d = new Date(e.date);
    return d >= weekAgo && d <= now;
  }).sort((a, b) => (a.date + (a.time || '')) > (b.date + (b.time || '')) ? 1 : -1);
}

// === Рендеринг історії ===
// Рендерить таблицю історії за 7 днів
async function renderHistoryTable() {
  const tbody = document.querySelector('#history-table tbody');
  const data = await getHistoryLast7Days();
  tbody.innerHTML = '';
  // Сортуємо за спаданням дати+часу (нові зверху)
  data.sort((a, b) => {
    const d1 = new Date(a.date + 'T' + (a.time || '00:00'));
    const d2 = new Date(b.date + 'T' + (b.time || '00:00'));
    return d2 - d1;
  });
  data.forEach((entry, idx) => {
    const tr = document.createElement('tr');
    const itemsText = (entry.items||[]).map(it=>`${it.name} ${it.grams}г`).join('; ');
    const totalGr = (entry.items||[]).reduce((s,it)=>s+it.grams,0);
    const compensation = (entry.glucose > 7) ? ((entry.glucose - 7) / 2).toFixed(2) : '0';
    const ratio = MEAL_RATIOS[entry.meal] || 1;
    // Підсвічування гіпо/гіпер/норма
    let rowClass = '';
    let rowTitle = '';
    if (entry.glucose < 4) {
      rowClass = 'hypo-row';
      rowTitle = 'Гіпоглікемія (глюкоза < 4)';
    } else if (entry.glucose > 10) {
      rowClass = 'hyper-row';
      rowTitle = 'Гіперглікемія (глюкоза > 10)';
    } else {
      rowClass = 'normal-row';
      rowTitle = 'Глюкоза в нормі (4–10)';
    }
    tr.className = rowClass;
    if (rowTitle) tr.title = rowTitle;
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.time||''}</td>
      <td>${entry.meal||''}</td>
      <td>${itemsText}</td>
      <td>${totalGr}</td>
      <td>${entry.carbs}</td>
      <td>${entry.glucose} ммоль/л</td>
      <td>${ratio}</td>
      <td>${compensation} од.</td>
      <td>${entry.recommendation} од.</td>
      <td><button class="delete-entry-btn" title="Видалити запис" style="color:#e53935;font-size:1.2em;background-color: white;cursor:pointer;">🗑</button></td>
    `;
    tr.querySelector('.delete-entry-btn').onclick = async () => {
      if (!confirm('Видалити цей запис?')) return;
      let history = await get('history') || [];
      history = history.filter(h =>
        !(h.date === entry.date && h.time === entry.time && h.meal === entry.meal && h.carbs === entry.carbs && h.glucose === entry.glucose && h.recommendation === entry.recommendation)
      );
      await set('history', history);
      await renderHistoryTable();
      await renderChart7Days();
    };
    tbody.appendChild(tr);
  });
}

// === Графік Chart.js ===
let chart;
// Рендерить графік за 7 днів
async function renderChart7Days() {
  const ctx = document.getElementById('chart');
  if (!ctx) return;
  const data = await getHistoryLast7Days();
  if (!data.length) return;
  const labels = data.map(e => e.date + (e.time ? ' ' + e.time : ''));
  const glucose = data.map(e => e.glucose);
  const insulin = data.map(e => e.recommendation);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Глюкоза (ммоль/л)',
          data: glucose,
          borderColor: '#e53935',
          backgroundColor: 'rgba(229,57,53,0.1)',
          yAxisID: 'y',
          tension: 0.2,
          pointRadius: 3,
          fill: false,
        },
        {
          type: 'bar',
          label: 'Apidra (од.)',
          data: insulin,
          backgroundColor: '#1976d2',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Глюкоза (ммоль/л)' },
          min: 0
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Apidra (од.)' },
          min: 0,
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

// === Оновлення після збереження ===
// Оновлює історію та графік після збереження запису
async function afterSave() {
  await renderHistoryTable();
  await renderChart7Days();
}

// === ДОДАНО: Рендер історії та графіка при завантаженні сторінки ===
(async () => {
  await renderHistoryTable();
  await renderChart7Days();
})();

// === Експорт історії у CSV та PDF за період ===
function exportHistoryCsv(entries) {
  if (!entries.length) return;
  const header = [
    'Дата','Час','Прийом їжі','Продукти','Грами','ХО','Глюкоза (ммоль/л)','Коефіцієнт','Компенсація (од.)','Інсулін (од.)'
  ];
  const rows = entries.map(entry => {
    const itemsText = (entry.items||[]).map(it=>`${it.name} ${it.grams}г`).join('; ');
    const totalGr = (entry.items||[]).reduce((s,it)=>s+it.grams,0);
    const compensation = (entry.glucose > 7) ? ((entry.glucose - 7) / 2).toFixed(2) : '0';
    const ratio = (typeof MEAL_RATIOS !== 'undefined' && MEAL_RATIOS[entry.meal]) ? MEAL_RATIOS[entry.meal] : 1;
    return [
      entry.date,
      entry.time || '',
      entry.meal || '',
      itemsText,
      totalGr,
      entry.carbs,
      entry.glucose + ' ммоль/л',
      'x' + ratio,
      compensation + ' од.',
      entry.recommendation + ' од.'
    ];
  });
  const csv = [header, ...rows].map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diabetes_history.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// === Експорт історії у PDF за період ===
function exportHistoryPdf(entries, periodText = '') {
  if (!entries.length) return;
  // Сортуємо за спаданням дати+часу (нові зверху)
  entries = entries.slice().sort((a, b) => {
    const d1 = new Date(a.date + 'T' + (a.time || '00:00'));
    const d2 = new Date(b.date + 'T' + (b.time || '00:00'));
    return d2 - d1;
  });
  const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  if (doc.getFontList && doc.getFontList()['PTSans-Regular']) {
    doc.setFont('PTSans-Regular');
  } else {
    doc.setFont('helvetica');
  }
  doc.setFontSize(16);
  doc.text('Щоденник діабету', 10, 14);
  doc.setFontSize(11);
  if (periodText) doc.text('Період: ' + periodText, 10, 22);
  // Статистика
  const glucoseArr = entries.map(e => parseFloat(e.glucose)).filter(x => !isNaN(x));
  const insulinArr = entries.map(e => parseFloat(e.recommendation)).filter(x => !isNaN(x));
  const avgGlucose = glucoseArr.length ? (glucoseArr.reduce((a,b)=>a+b,0)/glucoseArr.length) : 0;
  const avgInsulin = insulinArr.length ? (insulinArr.reduce((a,b)=>a+b,0)/insulinArr.length) : 0;
  const hypoCount = glucoseArr.filter(x => x < 4).length;
  const hyperCount = glucoseArr.filter(x => x > 10).length;
  const inTargetCount = glucoseArr.filter(x => x >= 4 && x <= 10).length;
  const percentInTarget = glucoseArr.length ? Math.round(inTargetCount / glucoseArr.length * 100) : 0;
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const last3m = entries.filter(e => new Date(e.date) >= threeMonthsAgo);
  const last3mGlucose = last3m.map(e => parseFloat(e.glucose)).filter(x => !isNaN(x));
  const avg3mGlucose = last3mGlucose.length ? (last3mGlucose.reduce((a,b)=>a+b,0)/last3mGlucose.length) : 0;
  const hba1c = avg3mGlucose ? ((avg3mGlucose + 2.59) / 1.59) : 0;
  let statY = 30;
  doc.setFontSize(10);
  doc.text(`Середня глюкоза: ${avgGlucose.toFixed(2)} ммоль/л`, 10, statY);
  doc.text(`Середня доза інсуліну: ${avgInsulin.toFixed(2)} од.`, 70, statY);
  doc.text(`Гіпо (<4): ${hypoCount}`, 120, statY);
  doc.text(`Гіпер (>10): ${hyperCount}`, 150, statY);
  doc.text(`% у цільовому діапазоні: ${percentInTarget}%`, 180, statY);
  doc.text(`HbA1c (ост. 3 міс.): ${hba1c ? hba1c.toFixed(2) : '—'} %`, 230, statY);
  // Додаю графік (якщо є)
  const chartCanvas = document.getElementById('chart');
  if (chartCanvas) {
    const imgData = chartCanvas.toDataURL('image/png', 1.0);
    doc.addImage(imgData, 'PNG', 10, statY + 8, 120, 45);
    statY += 50;
  }
  // Таблиця
  const header = [
    'Дата','Час','Прийом їжі','Продукти','Грами','ХО','Глюкоза','Коеф.','Компенсація','Інсулін'
  ];
  const rows = entries.map(entry => {
    const itemsText = (entry.items||[]).map(it=>`${it.name} ${it.grams}г`).join('; ');
    const totalGr = (entry.items||[]).reduce((s,it)=>s+it.grams,0);
    const compensation = (entry.glucose > 7) ? ((entry.glucose - 7) / 2).toFixed(2) : '0';
    const ratio = (typeof MEAL_RATIOS !== 'undefined' && MEAL_RATIOS[entry.meal]) ? MEAL_RATIOS[entry.meal] : 1;
    return [
      entry.date,
      entry.time || '',
      entry.meal || '',
      itemsText,
      totalGr,
      entry.carbs,
      entry.glucose,
      'x' + ratio,
      compensation,
      entry.recommendation
    ];
  });
  doc.autoTable({
    head: [header],
    body: rows,
    startY: statY + 6,
    styles: { font: (doc.getFontList && doc.getFontList()['PTSans-Regular']) ? 'PTSans-Regular' : 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
  });
  // === Предпросмотр PDF у модальному вікні ===
  let modal = document.getElementById('pdf-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pdf-preview-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = '<div style="background:#fff;padding:16px 8px 8px 8px;border-radius:8px;max-width:98vw;max-height:96vh;overflow:auto;position:relative;"><button id="close-pdf-preview" style="position:absolute;top:8px;right:12px;font-size:1.5em;z-index:2;">×</button><iframe id="pdf-preview-frame" style="width:90vw;height:80vh;border:none;"></iframe><div style="text-align:center;margin-top:8px;"><button id="download-pdf-btn" class="label-btn">Завантажити PDF</button></div></div>';
    document.body.appendChild(modal);
  }
  const frame = modal.querySelector('#pdf-preview-frame');
  const closeBtn = modal.querySelector('#close-pdf-preview');
  const downloadBtn = modal.querySelector('#download-pdf-btn');
  frame.src = doc.output('dataurlstring');
  modal.style.display = 'flex';
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  downloadBtn.onclick = () => { doc.save('diabetes_history.pdf'); };
}

// === Формування тексту періоду для статистики, PDF, графіка ===
function getPeriodText(period, year, month, from, to) {
  const monthsUA = [
    'січень','лютий','березень','квітень','травень','червень','липень','серпень','вересень','жовтень','листопад','грудень'
  ];
  if (period === 'all') return 'весь час';
  if (period === 'year' && year) return `рік ${year}`;
  if (period === 'month' && year && month!=='') return `${monthsUA[parseInt(month)]} ${year}`;
  if (period === 'range' && from && to) {
    const f = from.split('-').reverse().join('.');
    const t = to.split('-').reverse().join('.');
    return `${f} – ${t}`;
  }
  return '';
}

// === Експорт/Імпорт JSON у шапці ===
const exportJsonBtn = document.getElementById('export-data');
const importJsonBtn = document.getElementById('import-data');
const importFileInput = document.getElementById('import-file');

// Експорт JSON
if (exportJsonBtn) {
  exportJsonBtn.addEventListener('click', async () => {
    const history = await get('history') || [];
    const blob = new Blob([JSON.stringify(history, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diabetes_history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Імпорт JSON
if (importJsonBtn && importFileInput) {
  importJsonBtn.addEventListener('click', () => {
    importFileInput.value = '';
    importFileInput.click();
  });
  importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        await set('history', data);
        await renderHistoryTable();
        await renderChart7Days();
        alert('Історію імпортовано!');
      } else {
        alert('Файл не містить масив історії!');
      }
    } catch (e) {
      alert('Помилка при імпорті JSON!');
    }
  });
}

// Додаю підтвердження перед очищенням історії за сьогодні
if (clearTodayBtn) {
  clearTodayBtn.addEventListener('click', async () => {
    if (!confirm('Ви впевнені, що хочете очистити історію за сьогодні?')) return;
    // ...очищення як було...
    const today = new Date().toISOString().slice(0, 10);
    let history = await get('history') || [];
    history = history.filter(e => e.date !== today);
    await set('history', history);
    await renderHistoryTable();
    await renderChart7Days();
    alert('Історію за сьогодні очищено!');
  });
}

// === АНАЛІТИКА: Статистика за період ===
// Рендерить статистику за період
async function renderHistoryStats(entries, periodText) {
  const statsDiv = document.getElementById('history-stats');
  if (!statsDiv) return;
  if (!entries || !entries.length) {
    statsDiv.innerHTML = `<em>Немає даних для статистики за обраний період${periodText ? ' ('+periodText+')' : ''}.</em>`;
    return;
  }
  const glucoseArr = entries.map(e => parseFloat(e.glucose)).filter(x => !isNaN(x));
  const insulinArr = entries.map(e => parseFloat(e.recommendation)).filter(x => !isNaN(x));
  const avgGlucose = glucoseArr.length ? (glucoseArr.reduce((a,b)=>a+b,0)/glucoseArr.length) : 0;
  const avgInsulin = insulinArr.length ? (insulinArr.reduce((a,b)=>a+b,0)/insulinArr.length) : 0;
  const hypoCount = glucoseArr.filter(x => x < 4).length;
  const hyperCount = glucoseArr.filter(x => x > 10).length;
  const inTargetCount = glucoseArr.filter(x => x >= 4 && x <= 10).length;
  const percentInTarget = glucoseArr.length ? Math.round(inTargetCount / glucoseArr.length * 100) : 0;

  // HbA1c за останні 3 місяці (якщо є дані)
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const last3m = entries.filter(e => new Date(e.date) >= threeMonthsAgo);
  const last3mGlucose = last3m.map(e => parseFloat(e.glucose)).filter(x => !isNaN(x));
  const avg3mGlucose = last3mGlucose.length ? (last3mGlucose.reduce((a,b)=>a+b,0)/last3mGlucose.length) : 0;
  // Формула DCCT: HbA1c = (середня глюкоза + 2.59) / 1.59
  const hba1c = avg3mGlucose ? ((avg3mGlucose + 2.59) / 1.59) : 0;

  statsDiv.innerHTML = `
    <b>Статистика за період${periodText ? ' ('+periodText+')' : ''}:</b><br/>
    Середня глюкоза: <b>${avgGlucose.toFixed(2)}</b> ммоль/л<br/>
    Середня доза інсуліну: <b>${avgInsulin.toFixed(2)}</b> од.<br/>
    Кількість гіпо (<4): <b>${hypoCount}</b><br/>
    Кількість гіпер (>10): <b>${hyperCount}</b><br/>
    Відсоток у цільовому діапазоні (4–10): <b>${percentInTarget}%</b><br/>
    HbA1c (останні 3 міс.): <b>${hba1c ? hba1c.toFixed(2) : '—'}</b> %
  `;
}

// Рендерить таблицю і статистику при старті/зміні фільтра
async function renderHistoryTableAndStats() {
  await renderHistoryTable();
  const entries = await get('history') || [];
  // Для статистики беремо всі записи за 7 днів (або можна змінити на фільтрований період)
  const data = await getHistoryLast7Days();
  // Додаю дефолтний період для старту
  const period = 'all';
  const year = '';
  const month = '';
  const from = '';
  const to = '';
  const periodText = getPeriodText(period, year, month, from, to);
  await renderHistoryStats(data, periodText);
}

// === ДОДАНО: Рендер історії, графіка, статистики при завантаженні сторінки ===
(async () => {
  await renderHistoryTableAndStats();
  await renderChart7Days();
})();

// === Відновлена функція для рендеру блоку експорту і вибору періоду ===
function addExportButtons() {
  const historySection = document.getElementById('history-section');
  if (!historySection) return;
  let exportDiv = document.getElementById('export-period-btns');
  if (!exportDiv) {
    exportDiv = document.createElement('div');
    exportDiv.id = 'export-period-btns';
    exportDiv.style.margin = '10px 0';
    historySection.insertBefore(exportDiv, historySection.firstChild.nextSibling);
  }
  // Місяці українською
  const monthsUA = [
    'Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'
  ];
  exportDiv.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
      <label>Період:
        <select id="export-period">
          <option value="all">Весь</option>
          <option value="year">Рік</option>
          <option value="month">Місяць</option>
          <option value="range">Діапазон</option>
        </select>
      </label>
      <input type="number" id="export-year" placeholder="YYYY" min="2000" max="2100" style="display:none;width:80px;" />
      <select id="export-month" style="display:none;width:120px;">
        ${monthsUA.map((m,i)=>`<option value="${i}">${m}</option>`).join('')}
      </select>
      <input type="date" id="export-from" style="display:none;" />
      <input type="date" id="export-to" style="display:none;" />
      <button id="export-pdf" class="label-btn">Експорт PDF</button>
    </div>`;

  const periodSel = document.getElementById('export-period');
  const yearInp = document.getElementById('export-year');
  const monthInp = document.getElementById('export-month');
  const fromInp = document.getElementById('export-from');
  const toInp = document.getElementById('export-to');

  function updateInputs(){
    yearInp.style.display='none';
    monthInp.style.display='none';
    fromInp.style.display='none';
    toInp.style.display='none';
    if(periodSel.value==='year'){
      yearInp.style.display='';
    }else if(periodSel.value==='month'){
      yearInp.style.display='';
      monthInp.style.display='';
    }else if(periodSel.value==='range'){
      fromInp.style.display='';
      toInp.style.display='';
    }
  }
  periodSel.addEventListener('change',updateStatsAndInputs);
  yearInp.addEventListener('input',updateStatsAndInputs);
  monthInp.addEventListener('change',updateStatsAndInputs);
  fromInp.addEventListener('change',updateStatsAndInputs);
  toInp.addEventListener('change',updateStatsAndInputs);
  updateInputs();
  updateStatsAndInputs();

  async function updateStatsAndInputs() {
    updateInputs();
    const period=periodSel.value;
    const entries=await getEntries();
    const filtered=filterEntriesByPeriod(entries,period,yearInp.value,monthInp.value,fromInp.value,toInp.value);
    const periodText = getPeriodText(period, yearInp.value, monthInp.value, fromInp.value, toInp.value);
    renderHistoryStats(filtered, periodText);
  }

  document.getElementById('export-pdf').onclick = async ()=>{
    const period=periodSel.value;
    const entries=await getEntries();
    const filtered=filterEntriesByPeriod(entries,period,yearInp.value,monthInp.value,fromInp.value,toInp.value);
    if (!filtered.length) { alert('Немає записів за обраний період!'); return; }
    const periodText = getPeriodText(period, yearInp.value, monthInp.value, fromInp.value, toInp.value);
    exportHistoryPdf(filtered, periodText);
  };
}

addExportButtons();

// === Додаю функцію фільтрації за період ===
// Фільтрує записи за вибраним періодом (весь, рік, місяць, діапазон)
function filterEntriesByPeriod(entries, period, year, month, from, to) {
  if (!Array.isArray(entries)) return [];
  if (period === 'all') return entries.slice();
  if (period === 'year' && year) {
    return entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === parseInt(year);
    });
  }
  if (period === 'month' && year && month !== '') {
    return entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month);
    });
  }
  if (period === 'range' && from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return entries.filter(e => {
      const d = new Date(e.date);
      return d >= fromDate && d <= toDate;
    });
  }
  return entries.slice();
}