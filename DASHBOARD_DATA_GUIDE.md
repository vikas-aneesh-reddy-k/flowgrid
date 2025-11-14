# 📊 Dashboard Data Guide

## ✅ Dashboard Fixed - Now Shows Live Data!

### What Was Wrong
The Dashboard component was looking for data in the wrong structure:
- **Expected**: `stats.totalRevenue`
- **Actual API Response**: `stats.metrics.totalRevenue.value`

### What I Fixed
Updated the Dashboard to correctly access the nested API response structure.

---

## 🔄 How Dashboard Data Updates

### Dashboard Metrics Explained

#### 1. **Total Revenue** 💰
- **Source**: Sum of all orders (current month)
- **Updates When**:
  - ✅ New order is created
  - ✅ Order status changes (except cancelled)
  - ✅ Invoice is paid
- **Calculation**: `SUM(order.total)` for current month
- **Change %**: Compared to last month's revenue

#### 2. **Active Orders** 📦
- **Source**: Count of orders in progress
- **Updates When**:
  - ✅ New order is created
  - ✅ Order status changes to: pending, processing, or shipped
  - ✅ Order is completed or cancelled (decreases count)
- **Calculation**: `COUNT(orders)` where status = pending/processing/shipped

#### 3. **Inventory Value** 📊
- **Source**: Total value of all products in stock
- **Updates When**:
  - ✅ New product is added
  - ✅ Product stock is updated
  - ✅ Product price changes
  - ✅ Order is placed (stock decreases)
- **Calculation**: `SUM(product.price × product.stock)` for all active products
- **Low Stock Count**: Number of products with status 'low_stock' or 'out_of_stock'

#### 4. **Total Employees** 👥
- **Source**: Count of active employees
- **Updates When**:
  - ✅ New employee is hired
  - ✅ Employee status changes to active/inactive
- **Calculation**: `COUNT(employees)` where status = 'active'

---

## 📈 What Actions Update Dashboard Data

### Creating a New Order
**Affects**:
- ✅ Total Revenue (+order amount)
- ✅ Active Orders (+1)
- ✅ Inventory Value (stock decreases)
- ✅ Recent Activity (shows new order)

**Example**:
```
Before: Revenue $10,000 | Orders: 5
Create Order: $500
After: Revenue $10,500 | Orders: 6
```

### Creating a New Invoice
**Affects**:
- ✅ Total Revenue (if order is created)
- ✅ Recent Activity (shows invoice)

**Note**: Invoices are created with orders, so they update revenue automatically.

### Adding/Updating Products
**Affects**:
- ✅ Inventory Value (recalculated)
- ✅ Low Stock Count (if stock < 10)
- ✅ Inventory Status widget
- ✅ Recent Activity (if low stock)

**Example**:
```
Add Product: Laptop, Price $1000, Stock 50
Inventory Value increases by: $50,000
```

### Updating Product Stock
**Affects**:
- ✅ Inventory Value (price × new stock)
- ✅ Low Stock Count (if stock < 10)
- ✅ Inventory Status percentages

**Example**:
```
Product: Mouse, Price $20, Stock 100
Update Stock to 5
Inventory Value decreases by: $1,900
Low Stock Count increases by: 1
```

### Adding a New Customer
**Affects**:
- ✅ Total Customers count (in CRM/Sales page)
- ❌ Does NOT directly affect dashboard metrics
- ✅ Affects dashboard when customer places an order

### Creating a New Lead
**Affects**:
- ✅ Active Leads count (in Sales page)
- ❌ Does NOT directly affect dashboard metrics
- ✅ Affects dashboard when lead converts to customer and places order

### Hiring an Employee
**Affects**:
- ✅ Total Employees (+1)
- ✅ Department stats (in Analytics)

---

## 🔄 Auto-Refresh Behavior

### Dashboard Stats
- **Auto-refresh**: Every 30 seconds
- **Manual refresh**: F5 or navigate away and back
- **On window focus**: Automatically refetches

### React Query Cache
- **Invalidation**: Happens after mutations (create/update/delete)
- **Background refetch**: Keeps data fresh
- **Stale time**: 30 seconds

---

## 🧪 Testing Dashboard Updates

### Test 1: Create an Order
1. Go to Finance page
2. Click "New Invoice"
3. Fill form and create
4. **Expected**: Dashboard revenue increases, active orders +1

### Test 2: Update Product Stock
1. Go to Inventory page
2. Click "Update Stock" on any product
3. Change stock quantity
4. **Expected**: Inventory value updates, low stock count changes

### Test 3: Add a Product
1. Go to Inventory page
2. Click "Add Product"
3. Fill form with price and stock
4. **Expected**: Inventory value increases by (price × stock)

### Test 4: Complete an Order
1. Go to Orders (if you have order management)
2. Change order status to "completed"
3. **Expected**: Active orders decreases by 1

---

## 📊 Dashboard Data Flow

```
User Action → API Call → Database Update → React Query Invalidation → Dashboard Refetch → UI Update
```

### Example Flow:
```
1. User creates invoice
2. POST /api/orders (creates order with invoice)
3. MongoDB: New order document saved
4. React Query: Invalidates ['orders'] and ['dashboard'] queries
5. Dashboard: Automatically refetches stats
6. UI: Shows updated revenue and order count
```

---

## 🎯 Quick Reference

| Metric | Updates From | Calculation |
|--------|--------------|-------------|
| Total Revenue | Orders (current month) | SUM(order.total) |
| Active Orders | Orders (pending/processing/shipped) | COUNT(orders) |
| Inventory Value | Products (price × stock) | SUM(price × stock) |
| Total Employees | Employees (active) | COUNT(employees) |
| Low Stock Items | Products (stock < 10) | COUNT(products) |

---

## ✅ Summary

**Dashboard now shows**:
- ✅ Real revenue from actual orders
- ✅ Live order counts
- ✅ Calculated inventory value
- ✅ Active employee count
- ✅ Auto-updates every 30 seconds
- ✅ Instant updates after actions

**To see data**:
1. Clear localStorage: `localStorage.clear()`
2. Refresh page (F5)
3. Login: `admin@flowgrid.com` / `admin123`
4. Dashboard will show real data from database

**To test updates**:
- Create an order → Revenue increases
- Update stock → Inventory value changes
- Add product → Inventory value increases
- All changes reflect immediately!
