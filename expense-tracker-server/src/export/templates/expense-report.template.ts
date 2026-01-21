export function generateExpenseReportHTML(data: {
  title: string;
  subtitle: string;
  dateRange: string;
  generatedDate: string;
  summaryCards: Array<{ label: string; value: string }>;
  transactions: Array<{
    index: number;
    date: string;
    category: string;
    description: string;
    amount: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: white;
      color: #0a0a0a;
      line-height: 1.5;
    }
    
    /* Page breaks */
    @page {
      margin-top: 0;
      margin-bottom: 40px;
    }
    
    @page :first {
      margin-top: 0;
    }
    
    /* Header with Purple Luxury theme */
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 40px 40px 36px 40px;
      page-break-after: avoid;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    
    .header .subtitle {
      font-size: 15px;
      opacity: 0.85;
      margin-bottom: 10px;
      font-weight: 400;
    }
    
    .header .meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      opacity: 0.7;
      margin-top: 14px;
      font-weight: 400;
    }
    
    .content {
      padding: 36px 40px 40px 40px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #0a0a0a;
      page-break-after: avoid;
    }
    
    /* Summary Cards Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    
    .summary-card {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      padding: 18px 16px;
      position: relative;
      overflow: hidden;
      min-height: 80px;
    }
    
    .summary-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #7c3aed;
    }
    
    .summary-card .label {
      font-size: 11px;
      text-transform: uppercase;
      color: #737373;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    
    .summary-card .value {
      font-size: 24px;
      font-weight: 700;
      color: #0a0a0a;
      line-height: 1.2;
      word-break: break-word;
    }
    
    /* Transaction Table */
    .table-container {
      margin-bottom: 32px;
      page-break-inside: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: auto;
    }
    
    thead {
      background: #1a1a1a;
      color: white;
      page-break-after: avoid;
    }
    
    th {
      padding: 14px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    th:first-child {
      width: 50px;
      text-align: center;
    }
    
    th:nth-child(2) {
      width: 90px;
    }
    
    th:nth-child(3) {
      width: 110px;
    }
    
    th:last-child {
      text-align: right;
      width: 100px;
    }
    
    tbody tr {
      border-bottom: 1px solid #e5e5e5;
      page-break-inside: avoid;
    }
    
    tbody tr:last-child {
      border-bottom: none;
    }
    
    tbody tr:nth-child(even) {
      background: #fafafa;
    }
    
    td {
      padding: 12px;
      font-size: 13px;
      vertical-align: middle;
    }
    
    td:first-child {
      text-align: center;
      color: #737373;
      font-weight: 500;
      font-size: 12px;
    }
    
    td:nth-child(2) {
      color: #404040;
      font-weight: 400;
    }
    
    td:nth-child(3) {
      color: #404040;
      font-weight: 500;
    }
    
    td:nth-child(4) {
      color: #0a0a0a;
      font-weight: 400;
    }
    
    td:last-child {
      text-align: right;
      font-weight: 600;
      color: #10b981;
      font-size: 13px;
    }
    
    /* Category Distribution */
    .category-distribution {
      margin-top: 32px;
      page-break-inside: avoid;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      gap: 12px;
      page-break-inside: avoid;
    }
    
    .category-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .category-name {
      width: 110px;
      font-size: 13px;
      font-weight: 500;
      color: #0a0a0a;
      flex-shrink: 0;
    }
    
    .category-bar-container {
      flex: 1;
      height: 20px;
      background: #fafafa;
      border-radius: 3px;
      overflow: hidden;
      position: relative;
    }
    
    .category-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    
    .category-amount {
      width: 90px;
      text-align: right;
      font-size: 13px;
      font-weight: 600;
      color: #0a0a0a;
      flex-shrink: 0;
    }
    
    .category-percentage {
      width: 50px;
      text-align: right;
      font-size: 12px;
      color: #737373;
      flex-shrink: 0;
    }
    
    /* Page break utilities */
    .page-break {
      page-break-before: always;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="header avoid-break">
    <h1>${data.title}</h1>
    <div class="subtitle">${data.subtitle}</div>
    <div class="meta">
      <span>${data.dateRange}</span>
      <span>Generated: ${data.generatedDate}</span>
    </div>
  </div>
  
  <div class="content">
    <h2 class="section-title">Summary Overview</h2>
    <div class="summary-grid">
      ${data.summaryCards
        .map(
          (card) => `
        <div class="summary-card">
          <div class="label">${card.label}</div>
          <div class="value">${card.value}</div>
        </div>
      `,
        )
        .join('')}
    </div>
    
    <h2 class="section-title">Transaction Details</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.transactions
            .map(
              (tx) => `
            <tr>
              <td>${tx.index}</td>
              <td>${tx.date}</td>
              <td>${tx.category}</td>
              <td>${tx.description}</td>
              <td>Rs ${tx.amount.toFixed(1)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    
    ${
      data.categoryDistribution.length > 0
        ? `
      <div class="page-break"></div>
      <h2 class="section-title">Category Distribution</h2>
      <div class="category-distribution">
        ${data.categoryDistribution
          .map(
            (cat) => `
          <div class="category-item">
            <div class="category-color" style="background: ${cat.color}"></div>
            <div class="category-name">${cat.category}</div>
            <div class="category-bar-container">
              <div class="category-bar" style="width: ${cat.percentage}%; background: ${cat.color}"></div>
            </div>
            <div class="category-amount">Rs ${cat.amount.toFixed(1)}</div>
            <div class="category-percentage">${cat.percentage.toFixed(1)}%</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `
        : ''
    }
  </div>
</body>
</html>
  `;
}
