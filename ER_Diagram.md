# Simplified ER Diagram - Core Business System

```mermaid
erDiagram
    USER {
        string id PK
        string email
        string name
        string role
    }

    CUSTOMER {
        string id PK
        string name
        string email
        string phone
        string status
    }

    PRODUCT {
        string id PK
        string sku
        string name
        decimal price
        int stock
    }

    ORDER {
        string id PK
        string customerId FK
        string status
        decimal total
        datetime orderDate
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        decimal unitPrice
    }

    INVOICE {
        string id PK
        string orderId FK
        decimal amount
        string status
        datetime dueDate
    }

    EMPLOYEE {
        string id PK
        string userId FK
        string department
        string position
    }

    %% Core Business Relationships
    USER ||--|| EMPLOYEE : "is"
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "included_in"
    ORDER ||--|| INVOICE : "generates"
```

## Core Business Flow

### Main Entities:
- **USER**: System users and authentication
- **CUSTOMER**: Business customers
- **PRODUCT**: Inventory items
- **ORDER**: Customer orders
- **ORDER_ITEM**: Order line items
- **INVOICE**: Billing documents
- **EMPLOYEE**: Staff information

### Key Business Flow:
1. **Customers** place **Orders**
2. **Orders** contain multiple **Order Items** (products)
3. **Orders** generate **Invoices** for billing
4. **Users** are **Employees** who manage the system
