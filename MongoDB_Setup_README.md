# FlowGrid MongoDB Setup

This script creates MongoDB collections for the FlowGrid business management system based on the ER diagram.

## Collections Created

1. **users** - Combined USER + EMPLOYEE tables
2. **customers** - Customer information
3. **products** - Product catalog
4. **orders** - Combined ORDER + ORDER_ITEM + INVOICE tables

## Prerequisites

- MongoDB running on localhost:27017
- Python 3.7+
- pymongo library

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure MongoDB is running:
```bash
mongod
```

## Usage

Run the setup script:
```bash
python setup_mongodb.py
```

## Database Structure

### users Collection
- Combined USER + EMPLOYEE entities
- Fields: _id, email, name, role, department, position, salary, hireDate, status

### customers Collection
- Customer information
- Fields: _id, name, email, phone, status, company, segment, totalValue, lastContact, createdAt

### products Collection
- Product catalog
- Fields: _id, sku, name, price, stock, status, category, description, createdAt, updatedAt

### orders Collection
- Combined ORDER + ORDER_ITEM + INVOICE
- Fields: _id, orderNumber, customerId, customerName, status, total, orderDate, deliveryDate, paymentStatus, shippingAddress, createdBy, createdByName, orderItems[], invoice{}

## Sample Data

The script loads sample data including:
- 5 users/employees
- 5 customers
- 5 products
- 3 orders with embedded order items and invoices

## Indexes Created

- users: email (unique), department
- customers: email, status, segment
- products: sku (unique), category, status
- orders: orderNumber (unique), customerId, status, orderDate, createdBy

## Connection Details

- Database: flowgrid
- Connection String: mongodb://localhost:27017/



