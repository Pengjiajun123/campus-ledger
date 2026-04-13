/**
 * data.js — localStorage 读写封装
 */
const KEYS = {
  RECORDS: 'campus_ledger_records',
  CATEGORIES: 'campus_ledger_categories',
  SETTINGS: 'campus_ledger_settings',
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-01', name: '餐饮', icon: '🍜', isCustom: false },
  { id: 'cat-02', name: '交通', icon: '🚌', isCustom: false },
  { id: 'cat-03', name: '购物', icon: '🛒', isCustom: false },
  { id: 'cat-04', name: '娱乐', icon: '🎮', isCustom: false },
  { id: 'cat-05', name: '学习', icon: '📚', isCustom: false },
  { id: 'cat-06', name: '医疗', icon: '💊', isCustom: false },
];

const DEFAULT_SETTINGS = {
  warningThreshold: 200,
  defaultCategories: ['餐饮', '交通', '购物', '娱乐', '学习', '医疗'],
  customCategories: [],
};

const EMOJI_LIST = [
  '🍜','🚌','🛒','🎮','📚','💊','☕','🎵',
  '🏠','💡','✈️','🎬','🍰','👕','💇','🐱',
  '🏃','📱','🎁','💰','🔧','🍕','🚗','📦',
];

// ===== helpers =====
function uuid() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== Records =====
function getRecords() {
  return readJSON(KEYS.RECORDS) || [];
}

function saveRecords(records) {
  writeJSON(KEYS.RECORDS, records);
}

function addRecord(record) {
  const records = getRecords();
  record.id = uuid();
  record.createdAt = Date.now();
  records.unshift(record);
  saveRecords(records);
  return record;
}

function deleteRecord(id) {
  const records = getRecords().filter(r => r.id !== id);
  saveRecords(records);
}

// ===== Categories =====
function getCategories() {
  return readJSON(KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
}

function saveCategories(categories) {
  writeJSON(KEYS.CATEGORIES, categories);
}

function addCategory(name, icon) {
  const categories = getCategories();
  const cat = { id: 'cat-' + uuid(), name, icon, isCustom: true };
  categories.push(cat);
  saveCategories(categories);
  return cat;
}

// ===== Settings =====
function getSettings() {
  return readJSON(KEYS.SETTINGS) || DEFAULT_SETTINGS;
}

function saveSettings(settings) {
  writeJSON(KEYS.SETTINGS, settings);
}

// ===== Init default data =====
function initData() {
  if (!readJSON(KEYS.CATEGORIES)) {
    saveCategories(DEFAULT_CATEGORIES);
  }
  if (!readJSON(KEYS.SETTINGS)) {
    saveSettings(DEFAULT_SETTINGS);
  }
}
