/**
 * stats.js — 统计计算（月度/分类汇总）
 */

function getMonthExpenseByCategory(year, month) {
  const records = getRecordsByMonth(year, month).filter(r => r.type === 'expense');
  const map = {};
  records.forEach(r => {
    const key = r.category;
    if (!map[key]) {
      map[key] = { category: r.category, icon: r.categoryIcon, amount: 0 };
    }
    map[key].amount += r.amount;
  });
  const list = Object.values(map).sort((a, b) => b.amount - a.amount);
  const total = list.reduce((s, c) => s + c.amount, 0);
  return { list, total };
}

function getLast6MonthsExpense(year, month) {
  const result = [];
  let y = year, m = month;
  for (let i = 0; i < 6; i++) {
    const records = getRecordsByMonth(y, m).filter(r => r.type === 'expense');
    const total = records.reduce((s, r) => s + r.amount, 0);
    result.unshift({ year: y, month: m, label: `${m}月`, total });
    m--;
    if (m < 1) { m = 12; y--; }
  }
  return result;
}
