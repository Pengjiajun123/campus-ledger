/**
 * app.js — 主入口，事件绑定
 */

(function () {
  // ===== Init =====
  initData();
  initStatsDate();

  // ===== Tab Navigation =====
  const tabButtons = document.querySelectorAll('.tab-bar__item');
  const tabPages = document.querySelectorAll('.tab-page');

  function switchTab(tabId) {
    tabPages.forEach(p => p.classList.toggle('active', p.id === tabId));
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));

    if (tabId === 'page-home') renderHome();
    if (tabId === 'page-records') renderRecords();
    if (tabId === 'page-stats') renderStats();
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ===== FAB =====
  document.getElementById('fab-add').addEventListener('click', openModal);

  // ===== Modal Close =====
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // ===== Type Switch in Modal =====
  document.querySelector('.modal__type-switch').addEventListener('click', e => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;
    selectedType = btn.dataset.type;
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === selectedType);
    });
  });

  // ===== Category Selection =====
  document.getElementById('category-grid').addEventListener('click', e => {
    const item = e.target.closest('.cat-item');
    if (!item) return;

    if (item.id === 'cat-custom') {
      openCustomCatModal();
      return;
    }

    const catId = item.dataset.catId;
    const categories = getCategories();
    selectedCategory = categories.find(c => c.id === catId) || null;
    renderCategoryGrid();
  });

  // ===== Save Record =====
  document.getElementById('btn-save').addEventListener('click', () => {
    const amountStr = document.getElementById('input-amount').value.trim();
    const amount = parseFloat(amountStr);
    if (!amountStr || isNaN(amount) || amount <= 0) {
      alert('请输入有效金额');
      return;
    }
    if (!selectedCategory) {
      alert('请选择分类');
      return;
    }

    const note = document.getElementById('input-note').value.trim();
    const date = document.getElementById('input-date').value || todayStr();

    addRecord({
      type: selectedType,
      amount,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      note,
      date,
    });

    closeModal();
    // Refresh current page
    const activePage = document.querySelector('.tab-page.active');
    if (activePage.id === 'page-home') renderHome();
    else if (activePage.id === 'page-records') renderRecords();
    else if (activePage.id === 'page-stats') renderStats();
  });

  // ===== Records Filter Tabs =====
  document.querySelector('.records-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.records-tab');
    if (!tab) return;
    currentRecordFilter = tab.dataset.filter;
    document.querySelectorAll('.records-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.filter === currentRecordFilter);
    });
    renderRecords();
  });

  // ===== Long Press to Delete =====
  let longPressTimer = null;

  document.getElementById('records-list').addEventListener('pointerdown', e => {
    const item = e.target.closest('.record-item');
    if (!item) return;

    longPressTimer = setTimeout(() => {
      // Toggle delete mode
      const wasDeleting = item.classList.contains('deleting');
      document.querySelectorAll('.record-item.deleting').forEach(el => {
        el.classList.remove('deleting');
      });
      if (!wasDeleting) item.classList.add('deleting');
    }, 500);
  });

  document.getElementById('records-list').addEventListener('pointerup', () => {
    clearTimeout(longPressTimer);
  });

  document.getElementById('records-list').addEventListener('pointerleave', () => {
    clearTimeout(longPressTimer);
  });

  // Delete button click
  document.getElementById('records-list').addEventListener('click', e => {
    const delBtn = e.target.closest('.record-delete-btn');
    if (!delBtn) return;
    const item = delBtn.closest('.record-item');
    const id = item.dataset.id;
    if (confirm('确定删除这条记录？')) {
      deleteRecord(id);
      renderRecords();
      renderHome();
    }
  });

  // ===== Month Switcher =====
  document.getElementById('month-prev').addEventListener('click', () => {
    statsMonth--;
    if (statsMonth < 1) { statsMonth = 12; statsYear--; }
    renderStats();
  });

  document.getElementById('month-next').addEventListener('click', () => {
    statsMonth++;
    if (statsMonth > 12) { statsMonth = 1; statsYear++; }
    renderStats();
  });

  // ===== Custom Category Modal =====
  document.getElementById('custom-cat-close').addEventListener('click', closeCustomCatModal);
  document.getElementById('custom-cat-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCustomCatModal();
  });

  document.getElementById('emoji-picker').addEventListener('click', e => {
    const opt = e.target.closest('.emoji-option');
    if (!opt) return;
    selectedEmoji = opt.dataset.emoji;
    renderEmojiPicker();
  });

  document.getElementById('btn-save-cat').addEventListener('click', () => {
    const name = document.getElementById('input-cat-name').value.trim();
    if (!name) { alert('请输入分类名称'); return; }
    if (!selectedEmoji) { alert('请选择图标'); return; }

    const cat = addCategory(name, selectedEmoji);
    selectedCategory = cat;
    closeCustomCatModal();
    renderCategoryGrid();
  });

  // ===== Register Service Worker =====
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }

  // ===== Initial Render =====
  renderHome();
})();
