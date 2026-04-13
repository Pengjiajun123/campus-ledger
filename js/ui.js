/**
 * ui.js — DOM 操作 / 页面渲染
 */

function formatMoney(n) {
  return '¥ ' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}月${parseInt(d)}日`;
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ===== Home Page =====
function renderHome() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const totals = calcMonthTotals(year, month);
  const balance = calcTotalBalance();

  document.getElementById('home-balance').textContent = formatMoney(balance);
  document.getElementById('home-income').textContent = formatMoney(totals.income);
  document.getElementById('home-expense').textContent = formatMoney(totals.expense);

  const recent = getRecentRecords(5);
  const timeline = document.getElementById('home-timeline');
  const empty = document.getElementById('home-empty');

  if (!recent.length) {
    timeline.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  timeline.innerHTML = recent.map(r => `
    <li class="timeline-item">
      <div class="timeline-item__icon">${r.categoryIcon}</div>
      <div class="timeline-item__info">
        <div class="timeline-item__cat">${r.category}</div>
        <div class="timeline-item__note">${r.note || ''}</div>
      </div>
      <div class="timeline-item__right">
        <div class="timeline-item__amount timeline-item__amount--${r.type}">
          ${r.type === 'expense' ? '-' : '+'}${formatMoney(r.amount)}
        </div>
        <div class="timeline-item__date">${formatDate(r.date)}</div>
      </div>
    </li>
  `).join('');
}

// ===== Records Page =====
let currentRecordFilter = 'expense';

function renderRecords() {
  const all = getRecords();
  const filtered = getRecordsByType(all, currentRecordFilter);
  const groups = groupRecordsByDate(filtered);
  const list = document.getElementById('records-list');
  const empty = document.getElementById('records-empty');

  if (!groups.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = groups.map(g => `
    <div class="records-date-group">
      <div class="records-date-label">${formatDate(g.date)}</div>
      <div class="records-date-items">
        ${g.items.map(r => `
          <div class="record-item" data-id="${r.id}">
            <div class="record-item__icon">${r.categoryIcon}</div>
            <div class="record-item__info">
              <div class="record-item__cat">${r.category}</div>
              <div class="record-item__note">${r.note || ''}</div>
            </div>
            <span class="record-item__amount record-item__amount--${r.type}">
              ${r.type === 'expense' ? '-' : '+'}${formatMoney(r.amount)}
            </span>
            <button class="record-delete-btn">删除</button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ===== Stats Page =====
let statsYear, statsMonth;

function initStatsDate() {
  const now = new Date();
  statsYear = now.getFullYear();
  statsMonth = now.getMonth() + 1;
}

function updateMonthLabel() {
  document.getElementById('month-label').textContent =
    `${statsYear}年${statsMonth}月`;
}

function renderStats() {
  updateMonthLabel();

  const categoryData = getMonthExpenseByCategory(statsYear, statsMonth);
  const detailEl = document.getElementById('category-detail');
  const pieEmpty = document.getElementById('stats-pie-empty');

  if (!categoryData.list.length) {
    pieEmpty.style.display = 'block';
    detailEl.innerHTML = '';
    // clear chart
    if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }
  } else {
    pieEmpty.style.display = 'none';
    renderDoughnutChart(categoryData);
    detailEl.innerHTML = categoryData.list.map((c, i) => {
      const pct = ((c.amount / categoryData.total) * 100).toFixed(1);
      return `
        <li class="category-detail-item">
          <span class="category-detail-item__icon">${c.icon}</span>
          <span class="category-detail-item__name">${c.category}</span>
          <span class="category-detail-item__amount">¥${c.amount.toFixed(2)}</span>
          <span class="category-detail-item__percent">${pct}%</span>
        </li>
      `;
    }).join('');
  }

  const monthlyData = getLast6MonthsExpense(statsYear, statsMonth);
  renderBarChart(monthlyData);

  // Warning
  const balance = calcTotalBalance();
  const threshold = getSettings().warningThreshold;
  const banner = document.getElementById('warning-banner');
  const text = document.getElementById('warning-text');
  if (balance < threshold) {
    text.textContent = `余额不足 ¥${threshold}，注意节省！`;
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
}

// ===== Modal =====
let selectedType = 'expense';
let selectedCategory = null;
let selectedEmoji = null;

function renderCategoryGrid() {
  const categories = getCategories();
  const grid = document.getElementById('category-grid');
  grid.innerHTML = categories.map(c => `
    <div class="cat-item${selectedCategory && selectedCategory.id === c.id ? ' active' : ''}" data-cat-id="${c.id}">
      <span class="cat-item__icon">${c.icon}</span>
      <span class="cat-item__name">${c.name}</span>
    </div>
  `).join('') + `
    <div class="cat-item" id="cat-custom">
      <span class="cat-item__icon">➕</span>
      <span class="cat-item__name">自定义</span>
    </div>
  `;
}

function renderEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  picker.innerHTML = EMOJI_LIST.map(e => `
    <div class="emoji-option${selectedEmoji === e ? ' active' : ''}" data-emoji="${e}">${e}</div>
  `).join('');
}

function openModal() {
  selectedType = 'expense';
  selectedCategory = null;
  document.getElementById('input-amount').value = '';
  document.getElementById('input-note').value = '';
  document.getElementById('input-date').value = todayStr();

  // Reset type buttons
  document.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === 'expense');
  });

  renderCategoryGrid();
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('input-amount').focus(), 300);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function openCustomCatModal() {
  selectedEmoji = null;
  document.getElementById('input-cat-name').value = '';
  renderEmojiPicker();
  document.getElementById('custom-cat-overlay').classList.add('open');
}

function closeCustomCatModal() {
  document.getElementById('custom-cat-overlay').classList.remove('open');
}
