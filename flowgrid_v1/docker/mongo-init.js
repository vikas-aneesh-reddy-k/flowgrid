// MongoDB initialization script
db = db.getSiblingDB('flowgrid');

// Create application user
db.createUser({
  user: 'flowgrid_user',
  pwd: 'flowgrid_password',
  roles: [
    {
      role: 'readWrite',
      db: 'flowgrid'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('customers');
db.createCollection('inventory');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.products.createIndex({ "sku": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.orders.createIndex({ "customerId": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.customers.createIndex({ "email": 1 }, { unique: true });
db.inventory.createIndex({ "productId": 1 });

print('Database initialized successfully!');