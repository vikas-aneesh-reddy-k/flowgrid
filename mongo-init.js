// MongoDB initialization script
db = db.getSiblingDB('flowgrid');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('customers');
db.createCollection('orders');
db.createCollection('employees');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.customers.createIndex({ email: 1 }, { unique: true });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.employees.createIndex({ email: 1 }, { unique: true });

print('✅ MongoDB initialized successfully');
