/**
 * records.js — 记录的查询、筛选、汇总
 */

function getRecordsByMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getRecords().filter(r => r.date.startsWith(prefix));
}

function getRecordsByType(records, type) {
  return records.filter(r => r.type === type);
}

function calcMonthTotals(year, month) {
  const records = getRecordsByMonth(year, month);
  const income = records
    .filter(r => r.type === 'income')
    .reduce((s, r) => s + r.amount, 0);
  const expense = records
    .filter(r => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);
  return { income, expense, balance: income - expense };
}

function calcTotalBalance() {
  const records = getRecords();
  const income = records
    .filter(r => r.type === 'income')
    .reduce((s, r) => s + r.amount, 0);
  const expense = records
    .filter(r => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);
  return income - expense;
}

function getRecentRecords(count) {
  return getRecords().slice(0, count);
}

function groupRecordsByDate(records) {
  const groups = {};
  records.forEach(r => {
    if (!groups[r.date]) groups[r.date] = [];
    groups[r.date].push(r);
  });
  // Sort dates descending
  const sorted = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  return sorted.map(date => ({ date, items: groups[date] }));
}
