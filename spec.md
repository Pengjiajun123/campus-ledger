# 📒 CampusLedger — 大学生活费记账应用 规格说明书

## 1. 项目概览（Project Overview）

**一句话描述：** 一款专为大学生设计的轻量级生活费管理工具，帮助用户追踪家长入账、日常支出，并通过可视化图表直观掌握每月花销与余额。

- **目标用户：** 在校大学生
- **核心价值：** 打开即用、零学习成本、让花钱变得”有据可查”
- **平台：** 手机端 H5 网页（移动端优先设计）

-----

## 2. 用户流程 & UI 设计

### 页面结构（底部 Tab 导航，共 3 个页面）

```
┌─────────────────────────────┐
│         顶部标题栏           │
│    "本月余额 ¥ 1,240.00"    │
├─────────────────────────────┤
│                             │
│         主内容区域           │
│                             │
├─────────────────────────────┤
│  [首页]   [记录]   [统计]   │  ← 底部 Tab
└─────────────────────────────┘
```

### Tab 1：首页（Overview）

- 顶部大字展示**当月余额**
- 本月入账总额 / 本月支出总额（两列对比卡片）
- 最近 5 条流水记录（时间线样式）
- 右下角悬浮按钮 **”+ 记一笔”**（快速记账入口）

### Tab 2：记录（Records）

- 顶部切换：**[支出]** / **[入账]**
- 列表展示全部记录，按日期分组
- 每条记录显示：图标 + 分类 + 备注 + 金额 + 日期
- 支持下拉刷新 / 滚动加载
- 长按记录可删除

### Tab 3：统计（Statistics）

- 月份切换器（← 2024年3月 →）
- **饼图**：各分类支出占比（Chart.js Doughnut）
- **分类明细列表**：图标 + 类别名 + 金额 + 占比%
- **月度柱状图**：近6个月支出趋势（Chart.js Bar）
- 底部：余额预警提示区（余额 < 预设阈值时变红）

### 快速记账弹窗（Modal）

```
┌──────────────────────────┐
│  记一笔        [关闭 ×]  │
│                          │
│  ¥ [ 金额输入框 ]        │
│                          │
│  类型：[支出] / [入账]   │
│                          │
│  分类：                  │
│  🍜餐饮 🚌交通 🛒购物    │
│  🎮娱乐 📚学习 💊医疗   │
│  ➕ 自定义               │
│                          │
│  备注：[选填]            │
│  日期：[今天 ▾]          │
│                          │
│      [ 确认保存 ]        │
└──────────────────────────┘
```

-----

## 3. 技术栈（Tech Stack）

|层级|技术                         |说明                             |
|--|---------------------------|-------------------------------|
|结构|HTML5                      |语义化标签                          |
|样式|CSS3                       |Flex/Grid 布局，CSS Variables 管理色彩|
|逻辑|Vanilla JavaScript (ES6+)  |无框架依赖                          |
|图表|Chart.js v4.x              |CDN 引入，Doughnut + Bar          |
|存储|localStorage               |所有数据本地持久化                      |
|字体|Google Fonts (Noto Sans SC)|中文优化字体                         |
|部署|GitHub Pages / Vercel      |静态托管，零成本                       |

### 设计规范（Design Tokens）

```css
:root {
  --bg:       #FAF8F5;  /* 背景色 */
  --accent:   #D97757;  /* 点缀色（按钮/图标） */
  --text:     #1A1A1A;  /* 正文色 */
  --muted:    #4A4543;  /* 辅助文字 */
  --card-bg:  #FFFFFF;  /* 卡片背景 */
  --border:   #EDE9E4;  /* 分割线 */
  --danger:   #E05252;  /* 预警红色 */
  --success:  #6AAF8B;  /* 入账绿色 */
}
```

-----

## 4. 核心功能 & 逻辑

### 4.1 添加记录

```
用户点击"+"按钮
  → 弹出 Modal
  → 输入金额（必填）
  → 选择类型（支出/入账）
  → 选择/创建分类
  → 填写备注（选填）
  → 选择日期（默认今天）
  → 点击确认
      → 生成 record 对象
      → 写入 localStorage
      → 更新首页余额显示
      → 关闭 Modal，列表刷新
```

### 4.2 余额计算逻辑

```javascript
// 伪代码
function calcBalance() {
  const records = getAllRecords();
  const totalIn  = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalOut = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  return totalIn - totalOut;
}
```

### 4.3 月度统计逻辑

```javascript
// 伪代码
function getMonthStats(year, month) {
  const records = getRecordsByMonth(year, month);
  const byCategory = groupBy(records, 'category');
  // 返回: { categoryName: totalAmount } 映射
  return byCategory;
}
```

### 4.4 余额预警

```javascript
// 伪代码
const WARNING_THRESHOLD = getUserSetting('warningAmount') || 200;
if (calcBalance() < WARNING_THRESHOLD) {
  showWarningBanner(`余额不足 ¥${WARNING_THRESHOLD}，注意节省！`);
}
```

-----

## 5. 数据结构

### Record（账单记录）

```json
{
  "id": "uuid-1234",
  "type": "expense",
  "amount": 28.5,
  "category": "餐饮",
  "categoryIcon": "🍜",
  "note": "食堂午饭",
  "date": "2024-03-15",
  "createdAt": 1710460800000
}
```

### Category（分类，支持自定义）

```json
{
  "id": "cat-001",
  "name": "餐饮",
  "icon": "🍜",
  "isCustom": false
}
```

### Settings（用户设置）

```json
{
  "warningThreshold": 200,
  "defaultCategories": ["餐饮","交通","购物","娱乐","学习","医疗"],
  "customCategories": []
}
```

### localStorage Keys

```
campus_ledger_records    → Record[]   （所有账单）
campus_ledger_categories → Category[] （所有分类）
campus_ledger_settings   → Settings   （用户设置）
```

-----

## 6. 文件结构（File Structure）

```
campus-ledger/
├── index.html          # 主入口（单页应用）
├── css/
│   ├── reset.css       # 样式重置
│   ├── variables.css   # CSS 变量/Design Tokens
│   ├── layout.css      # 整体布局（Tab、顶栏）
│   ├── components.css  # 卡片、按钮、Modal、列表
│   └── charts.css      # 图表区域样式
├── js/
│   ├── data.js         # localStorage 读写封装
│   ├── records.js      # 记录的增删查逻辑
│   ├── stats.js        # 统计计算（月度/分类汇总）
│   ├── charts.js       # Chart.js 图表渲染
│   ├── ui.js           # DOM 操作 / 页面渲染
│   └── app.js          # 主入口，事件绑定
├── assets/
│   └── icons/          # 可选：自定义图标
└── README.md
```

-----

## 7. 分步开发计划（Implementation Steps）

### Step 1：项目初始化 & 样式基础（Day 1 上午）

- [ ] 创建 HTML 骨架，引入 Chart.js CDN、Google Fonts
- [ ] 编写 `variables.css`，定义所有 Design Token
- [ ] 实现底部 Tab 导航结构与切换逻辑
- [ ] 完成移动端基础布局（viewport meta、flex 结构）

### Step 2：数据层（Day 1 下午）

- [ ] 编写 `data.js`：封装 `getRecords()` / `saveRecord()` / `deleteRecord()`
- [ ] 初始化默认分类数据写入 localStorage
- [ ] 编写 `records.js`：按月筛选、按分类汇总等工具函数

### Step 3：首页 & 记账 Modal（Day 2 上午）

- [ ] 渲染首页余额卡片、收支对比
- [ ] 渲染最近流水列表（时间线样式）
- [ ] 实现”+ 记一笔”浮动按钮 + Modal 弹出动画
- [ ] 完成 Modal 表单：金额输入、类型切换、分类选择、日期选择
- [ ] 实现保存逻辑，保存后刷新首页数据

### Step 4：记录页（Day 2 下午）

- [ ] 渲染全量账单列表，按日期分组
- [ ] 实现支出 / 入账 Tab 切换筛选
- [ ] 实现长按删除（含确认提示）

### Step 5：统计页 & 图表（Day 3 上午）

- [ ] 实现月份切换器
- [ ] 用 Chart.js 渲染支出饼图（Doughnut）
- [ ] 渲染分类明细列表（带占比）
- [ ] 渲染近6月趋势柱状图（Bar）

### Step 6：自定义分类 & 设置（Day 3 下午）

- [ ] 实现”+ 自定义分类”：输入名称 + 选 Emoji 图标
- [ ] 实现余额预警阈值设置入口
- [ ] 预警 Banner 的触发与展示逻辑

### Step 7：测试 & 部署（Day 4）

- [ ] 手机端真机测试（iPhone Safari / Android Chrome）
- [ ] 边缘情况处理（无数据空状态、金额校验）
- [ ] 上传至 GitHub，开启 Pages 部署
- [ ] 生成访问链接，添加到手机桌面书签

-----

## 附：MVP 功能优先级

|功能         |优先级 |说明      |
|-----------|----|--------|
|快速记账（支出/入账）|🔴 P0|核心功能，必须 |
|余额展示       |🔴 P0|核心功能，必须 |
|首页流水列表     |🔴 P0|核心功能，必须 |
|饼图统计       |🟠 P1|重要，MVP包含|
|月份切换       |🟠 P1|重要，MVP包含|
|自定义分类      |🟡 P2|可在V1.1迭代|
|余额预警       |🟡 P2|可在V1.1迭代|
|月度趋势柱状图    |🟢 P3|V1.2迭代  |