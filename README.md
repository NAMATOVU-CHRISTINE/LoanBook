# LoanBook App Documentation

A mobile application built with Expo for managing loans, tracking financial transactions, and generating balance sheets.

## App Structure

### Core Modules
- **Loan Management**: Create, view, and edit loans.
- **Financial Tracking**: Record income, expenses, and interest.
- **Reports**: Generate balance sheets and transaction summaries.
- **Dashboard**: Visualize financial performance.

## Screen-by-Screen Breakdown

### 1. Transaction Ledger (Page 1)
**Purpose**: Display daily transactions and closing balances.

**UI Components**:
- Table with columns: Date, Transaction Narration, Amount, Closing Balance.
- Example row: `Wednesday, 1 January 2025 | Balance B/F | - | -`.
- Static label: Account Balance.

### 2. Debtors List (Pages 2–3)
**Purpose**: Track loan repayments and aging.

**UI Components**:
- Columns: No, Name, Amount, Interest, Balance, Repayment Date, Aging.
- Simplified view on Page 3: No, Details, Amount, Date, Aging, Total.

### 3. Balance Sheet (Page 4)
**Purpose**: Summarize assets, liabilities, and equity.

**UI Components**:
- **Assets**: Debtors, Cash at Hand, Cash at Bank.
- **Equity**: Capital, Retained Earnings.
- **Liabilities**: Loans.
- **Totals**: Total Assets, Total Liabilities and Equity.

### 4. Interest & Expenses (Page 5)
**Purpose**: Track monthly interest earned and expenses.

**UI Components**:
- **Interest Earned**: List of customers with amounts (e.g., Customer 1: 10,000,000).
- **Total Interest Earned**: 10,334,467.
- **Expenses**: Categories like Transport Charges, Airtime and Data, Service Charges.
- **Profits**: Calculated as Interest Earned - Expenses.

### 5. Loan Details Form (Page 6)
**Purpose**: Add or edit loan entries.

**UI Components**:
- Input fields: Name, Loan Type (dropdown), Amount, Interest, Repayment Date (date picker).
- Buttons: Share, Reset, Confirm Submission.
- Confirmation modal: "Are you sure you want to submit the loan details?".

### 6. Interest & Expenses Form (Page 7)
**Purpose**: Input monthly interest and expenses.

**UI Components**:
- Fields: Month (dropdown), Interest Earned, Expenses (with subcategories).
- Buttons: Save, Reset, Confirm Submission.

### 7. Transactions Log (Page 8)
**Purpose**: View and add transaction details.

**UI Components**:
- Table columns: No, Details, Amount, Date, Aging.
- Button: Save.

### 8. Balance Sheet Dashboard (Page 9)
**Purpose**: Visualize financial data.

**UI Components**:
- **Assets Distribution**: Pie chart for Cash at Hand, Cash at Bank.
- **Liabilities Distribution**: Bar chart for Loans, Expenses.
- **Overall Performance**: Line graph showing trends.
- **Export to CSV**: Button to download data.

### 9. Financial Ledger (Page 10)
**Purpose**: Comprehensive transaction history.

**UI Components**:
- Table columns: #, Transaction Narration, Amount, Closing Balance.
- Button: Save.

## Navigation Flow
- **Bottom Tabs**:
  - Loan Details
  - Interest & Expenses
  - Transactions
  - Balance Sheet
  - Financial Ledger
- **Side Menu**: Logout, Export to CSV, Toggle Dark Mode.

## Data Models

### Loan
```json
{
  "id": "string",
  "name": "string",
  "type": "Personal/Business",
  "amount": "number",
  "interest": "number",
  "balance": "number",
  "repaymentDate": "date",
  "aging": "number"
}
```

### Transaction
```json
{
  "date": "date",
  "narration": "string",
  "amount": "number",
  "closingBalance": "number"
}
```

### Balance Sheet
```json
{
  "assets": {
    "cashAtHand": "number",
    "cashAtBank": "number",
    "debtors": "number"
  },
  "liabilities": {
    "loans": "number"
  },
  "equity": {
    "capital": "number",
    "retainedEarnings": "number"
  }
}
```

## Technical Considerations
- **Expo Libraries**: Use `react-navigation` for tab-based routing, `react-native-charts-wrapper` for graphs.
- **State Management**: Redux or Context API for shared financial data.
- **Data Persistence**: SQLite or Firebase for offline/online sync.
- **Validation**: Form validation for loan/expense submissions (e.g., numeric fields, date formats).

## User Flow Example
1. Add a loan via Loan Details → Input data → Confirm.
2. Record monthly interest/expenses via Interest & Expenses.
3. View aggregated data on Balance Sheet Dashboard.
4. Export CSV for external reporting.

## Next Steps
- Implement placeholder resolution (e.g., date format m/a/ayyyy → MM/DD/YYYY).
- Add error handling for form submissions.
- Integrate charts and CSV export functionality.

This documentation provides a blueprint for developers to build the app and for stakeholders to understand its functionality.