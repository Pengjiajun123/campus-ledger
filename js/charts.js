/**
 * charts.js — Chart.js 图表渲染
 */

let doughnutChart = null;
let barChart = null;

const CHART_COLORS = [
  '#D97757', '#6AAF8B', '#5B8BD4', '#E0A854',
  '#9B7ED4', '#D46B8C', '#4DBAB5', '#8B8B8B',
  '#C75B39', '#5DAA5D', '#7B68AE', '#D4A05A',
];

function renderDoughnutChart(categoryData) {
  const canvas = document.getElementById('chart-doughnut');
  const ctx = canvas.getContext('2d');

  if (doughnutChart) {
    doughnutChart.destroy();
    doughnutChart = null;
  }

  if (!categoryData.list.length) return;

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.list.map(c => c.category),
      datasets: [{
        data: categoryData.list.map(c => c.amount),
        backgroundColor: CHART_COLORS.slice(0, categoryData.list.length),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const val = ctx.parsed;
              const pct = ((val / categoryData.total) * 100).toFixed(1);
              return ` ¥${val.toFixed(2)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderBarChart(monthlyData) {
  const canvas = document.getElementById('chart-bar');
  const ctx = canvas.getContext('2d');

  if (barChart) {
    barChart.destroy();
    barChart = null;
  }

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthlyData.map(m => m.label),
      datasets: [{
        data: monthlyData.map(m => m.total),
        backgroundColor: '#D97757',
        borderRadius: 6,
        barPercentage: 0.6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              return ` ¥${ctx.parsed.y.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#EDE9E4' },
          ticks: {
            font: { size: 11 },
            callback(v) { return '¥' + v; },
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
        },
      },
    },
  });
}
