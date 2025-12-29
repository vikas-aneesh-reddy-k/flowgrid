# Fix: Update User Role to Admin

## Problem
You're getting "Insufficient permissions" when trying to update products because your user doesn't have the required role (`admin` or `inventory_manager`).

## Solution 1: Update Your User to Admin (QUICKEST)

SSH into your EC2 instance and run these commands:

```bash
ssh -i flowgrid.pem ubuntu@13.51.176.153

# Connect to MongoDB container
docker exec -it flowgrid-mongodb-1 mongosh -u admin -p FlowGrid2024SecurePassword! --authenticationDatabase admin

# Switch to flowgrid database
use flowgrid

# Find your user (replace with your email)
db.users.findOne({ email: "your-email@example.com" })

# Update your user to admin role (replace with your email)
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

# Verify the update
db.users.findOne({ email: "your-email@example.com" })

# Exit MongoDB
exit
```

## Solution 2: Register a New Admin User

If you want to create a new admin user, you can register through the API:

```bash
# On your local machine or EC2
curl -X POST http://13.51.176.153/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@flowgrid.com",
    "password": "Admin123!",
    "name": "Admin User",
    "role": "admin"
  }'
```

Then login with this new admin account.

## Solution 3: Update Permissions (Already Done)

I've already updated the backend code to allow `sales_manager` role to also update products:

**Before:**
```typescript
router.put('/:id', authenticate, authorize('admin', 'inventory_manager'), updateProduct);
```

**After:**
```typescript
router.put('/:id', authenticate, authorize('admin', 'inventory_manager', 'sales_manager'), updateProduct);
```

This change needs to be deployed to EC2.

## Quick Fix Steps

### Step 1: Update Your User Role on EC2

```bash
# SSH into EC2
ssh -i flowgrid.pem ubuntu@13.51.176.153

# Run MongoDB command
docker exec -it flowgrid-mongodb-1 mongosh -u admin -p FlowGrid2024SecurePassword! --authenticationDatabase admin flowgrid --eval 'db.users.updateOne({email: "YOUR_EMAIL_HERE"}, {$set: {role: "admin"}})'

# Verify
docker exec -it flowgrid-mongodb-1 mongosh -u admin -p FlowGrid2024SecurePassword! --authenticationDatabase admin flowgrid --eval 'db.users.find({email: "YOUR_EMAIL_HERE"}).pretty()'
```

Replace `YOUR_EMAIL_HERE` with your actual email address.

### Step 2: Rebuild and Deploy Backend (Optional - for sales_manager support)

If you want sales_manager to also have update permissions:

```bash
# On your local machine
cd server
docker build -t vikaskakarla/flowgrid-backend:latest .
docker push vikaskakarla/flowgrid-backend:latest

# On EC2
ssh -i flowgrid.pem ubuntu@13.51.176.153
cd /home/ubuntu/flowgrid
docker compose pull backend
docker compose up -d backend
```

### Step 3: Logout and Login Again

After updating your role:
1. Logout from the application
2. Login again
3. Your new JWT token will have the updated role
4. Try updating products again

## Verify It's Working

After updating your role and logging in again:

1. Open browser console (F12)
2. Check your token:
   ```javascript
   const token = localStorage.getItem('authToken');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Your role:', payload.role);
   ```

3. Should show: `Your role: admin`

4. Try updating a product - should work now!

## Available Roles

- `admin` - Full access to everything
- `inventory_manager` - Can manage products and inventory
- `sales_manager` - Can manage sales, orders, customers, and products (after backend update)
- `sales_rep` - Can view and create orders
- `accountant` - Can manage invoices and financial data
- `hr_manager` - Can manage employees and payroll

## Summary

✅ Updated backend to allow sales_manager to update products
✅ Created script to update user roles
✅ Provided MongoDB commands to update your user to admin

**Quickest fix:** Run the MongoDB command on EC2 to update your user to admin role, then logout and login again.
