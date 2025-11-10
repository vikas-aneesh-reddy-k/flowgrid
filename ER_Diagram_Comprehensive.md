# ER Diagram - Business Management System with HR & Payroll

```mermaid
erDiagram
    USER {
        string id PK "User ID"
        string email "Email Address"
        string name "Full Name"
        string role "User Role"
        string password "Password Hash"
        datetime createdAt "Account Created"
    }

    CUSTOMER {
        string id PK "Customer ID"
        string name "Customer Name"
        string email "Email Address"
        string phone "Phone Number"
        string status "Customer Status"
    }

    PRODUCT {
        string id PK "Product ID"
        string sku "Product SKU"
        string name "Product Name"
        decimal price "Unit Price"
        int stock "Current Stock"
    }

    ORDER {
        string id PK "Order ID"
        string customerId FK "Customer ID"
        string status "Order Status"
        decimal total "Total Amount"
        datetime orderDate "Order Date"
    }

    ORDER_ITEM {
        string id PK "Order Item ID"
        string orderId FK "Order ID"
        string productId FK "Product ID"
        int quantity "Quantity"
        decimal unitPrice "Unit Price"
    }

    INVOICE {
        string id PK "Invoice ID"
        string orderId FK "Order ID"
        decimal amount "Invoice Amount"
        string status "Invoice Status"
        datetime dueDate "Due Date"
    }

    EMPLOYEE {
        string id PK "Employee ID"
        string userId FK "User ID"
        string department "Department"
        string position "Job Position"
        datetime hireDate "Hire Date"
        decimal baseSalary "Base Salary"
        string status "Employment Status"
    }

    PAYROLL {
        string id PK "Payroll ID"
        string employeeId FK "Employee ID"
        datetime payPeriodStart "Pay Period Start"
        datetime payPeriodEnd "Pay Period End"
        decimal baseSalary "Base Salary"
        decimal overtimePay "Overtime Pay"
        decimal bonuses "Bonuses"
        decimal grossPay "Gross Pay"
        decimal taxDeduction "Tax Deduction"
        decimal insuranceDeduction "Insurance Deduction"
        decimal netPay "Net Pay"
        string status "Payroll Status"
        datetime payDate "Pay Date"
    }

    LEAVE_REQUEST {
        string id PK "Leave Request ID"
        string employeeId FK "Employee ID"
        string type "Leave Type"
        datetime startDate "Start Date"
        datetime endDate "End Date"
        int days "Number of Days"
        string status "Request Status"
        string reason "Reason for Leave"
    }

    %% Core Business Relationships
    USER ||--o| EMPLOYEE : "is_a"
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "included_in"
    ORDER ||--o{ INVOICE : "generates"
    
    %% HR & Payroll Relationships
    EMPLOYEE ||--o{ PAYROLL : "receives"
    EMPLOYEE ||--o{ LEAVE_REQUEST : "submits"
```

## Entity Descriptions

### Core Business Entities
- **USER**: System users with authentication
- **CUSTOMER**: Business customers
- **PRODUCT**: Inventory items with pricing and stock
- **ORDER**: Customer orders with status tracking
- **ORDER_ITEM**: Individual items within orders
- **INVOICE**: Billing documents linked to orders

### HR & Payroll
- **EMPLOYEE**: Staff information linked to users with salary details
- **PAYROLL**: Payroll records with salary, overtime, bonuses, and deductions
- **LEAVE_REQUEST**: Employee leave requests and approvals

## Key Business Flows

### Sales Process
1. **Customers** place **Orders**
2. **Orders** contain **Order Items** (products)
3. **Orders** generate **Invoices**

### HR & Payroll Process
1. **Users** become **Employees** with salary information
2. **Employees** receive **Payroll** with various components
3. **Employees** submit **Leave Requests** for time off
