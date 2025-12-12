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
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      color: #1a202c;
    }
    
    .header {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      color: white;
      padding: 40px 50px;
    }
    
    .header h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 12px;
    }
    
    .header .meta {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      opacity: 0.7;
      margin-top: 16px;
    }
    
    .content {
      padding: 40px 50px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #1a202c;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .summary-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .summary-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #10b981;
    }
    
    .summary-card .label {
      font-size: 12px;
      text-transform: uppercase;
      color: #718096;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    
    .summary-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #1a202c;
    }
    
    .table-container {
      margin-bottom: 40px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    thead {
      background: #1a202c;
      color: white;
    }
    
    th {
      padding: 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    th:first-child {
      width: 60px;
      text-align: center;
    }
    
    th:last-child {
      text-align: right;
    }
    
    tbody tr {
      border-bottom: 1px solid #e2e8f0;
    }
    
    tbody tr:last-child {
      border-bottom: none;
    }
    
    tbody tr:nth-child(even) {
      background: #f7fafc;
    }
    
    td {
      padding: 16px;
      font-size: 14px;
    }
    
    td:first-child {
      text-align: center;
      color: #718096;
      font-weight: 500;
    }
    
    td:last-child {
      text-align: right;
      font-weight: 600;
      color: #10b981;
    }
    
    .category-distribution {
      margin-top: 40px;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
    }
    
    .category-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .category-name {
      width: 100px;
      font-size: 14px;
      font-weight: 500;
      color: #1a202c;
    }
    
    .category-bar-container {
      flex: 1;
      height: 24px;
      background: #f7fafc;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .category-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .category-amount {
      width: 100px;
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      color: #1a202c;
    }
    
    .category-percentage {
      width: 60px;
      text-align: right;
      font-size: 13px;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="header">
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
              <td>Rs ${tx.amount}</td>
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
            <div class="category-amount">Rs ${cat.amount}</div>
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
