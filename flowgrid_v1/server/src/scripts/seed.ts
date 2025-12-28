import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Employee } from '../models/Employee.js';
import { Order } from '../models/Order.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowgrid';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Employee.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.create([
      {
        email: 'admin@flowgrid.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'sales@flowgrid.com',
        password: 'sales123',
        name: 'Sales Manager',
        role: 'sales_manager',
      },
      {
        email: 'john@flowgrid.com',
        password: 'john123',
        name: 'John Smith',
        role: 'sales_rep',
      },
      {
        email: 'inventory@flowgrid.com',
        password: 'inventory123',
        name: 'Inventory Manager',
        role: 'inventory_manager',
      },
      {
        email: 'hr@flowgrid.com',
        password: 'hr123456',
        name: 'HR Manager',
        role: 'hr_manager',
      },
    ]);
    console.log('✅ Created users');

    // Create Products
    const products = await Product.create([
      {
        sku: 'SKU-1001',
        name: 'Laptop Pro 15',
        price: 1299,
        stock: 45,
        category: 'Electronics',
        description: 'High-performance laptop for professionals',
      },
      {
        sku: 'SKU-1002',
        name: 'Wireless Mouse',
        price: 29,
        stock: 12,
        category: 'Accessories',
        description: 'Ergonomic wireless mouse',
      },
      {
        sku: 'SKU-1003',
        name: 'USB-C Cable',
        price: 19,
        stock: 0,
        category: 'Accessories',
        description: 'Premium USB-C charging cable',
      },
      {
        sku: 'SKU-1004',
        name: 'Mechanical Keyboard',
        price: 149,
        stock: 78,
        category: 'Accessories',
        description: 'RGB mechanical gaming keyboard',
      },
      {
        sku: 'SKU-1005',
        name: 'Monitor 27"',
        price: 399,
        stock: 8,
        category: 'Electronics',
        description: '4K UHD monitor with HDR',
      },
      {
        sku: 'SKU-1006',
        name: 'Webcam HD',
        price: 89,
        stock: 34,
        category: 'Electronics',
        description: '1080p HD webcam with microphone',
      },
      {
        sku: 'SKU-1007',
        name: 'Desk Lamp',
        price: 45,
        stock: 56,
        category: 'Office',
        description: 'LED desk lamp with adjustable brightness',
      },
      {
        sku: 'SKU-1008',
        name: 'Office Chair',
        price: 299,
        stock: 23,
        category: 'Furniture',
        description: 'Ergonomic office chair with lumbar support',
      },
    ]);
    console.log('✅ Created products');

    // Create Customers
    const customers = await Customer.create([
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0123',
        status: 'active',
        company: 'Acme Corporation',
        segment: 'Enterprise',
        address: {
          street: '123 Business St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        totalOrders: 0,
        totalValue: 0,
      },
      {
        name: 'TechStart Inc.',
        email: 'info@techstart.com',
        phone: '+1-555-0124',
        status: 'active',
        company: 'TechStart Inc.',
        segment: 'SMB',
        address: {
          street: '456 Tech Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
        totalOrders: 0,
        totalValue: 0,
      },
      {
        name: 'Global Solutions Ltd.',
        email: 'contact@global.com',
        phone: '+1-555-0125',
        status: 'premium',
        company: 'Global Solutions Ltd.',
        segment: 'Enterprise',
        address: {
          street: '789 Global Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
        },
        totalOrders: 0,
        totalValue: 0,
      },
      {
        name: 'Innovation Labs',
        email: 'hello@innovation.com',
        phone: '+1-555-0126',
        status: 'active',
        company: 'Innovation Labs',
        segment: 'Startup',
        address: {
          street: '321 Innovation Way',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
        },
        totalOrders: 0,
        totalValue: 0,
      },
      {
        name: 'Digital Dynamics',
        email: 'info@digitaldynamics.com',
        phone: '+1-555-0127',
        status: 'active',
        company: 'Digital Dynamics',
        segment: 'Enterprise',
        address: {
          street: '555 Digital Dr',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
        },
        totalOrders: 0,
        totalValue: 0,
      },
    ]);
    console.log('✅ Created customers');

    // Create Employees
    const employees = await Employee.create([
      {
        employeeId: 'EMP-00001',
        userId: users[0]._id,
        name: users[0].name,
        email: users[0].email,
        phone: '+1-555-1001',
        department: 'Management',
        position: 'CEO',
        hireDate: new Date('2020-01-15'),
        baseSalary: 150000,
        status: 'active',
        address: {
          street: '100 Executive Ln',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
        },
      },
      {
        employeeId: 'EMP-00002',
        userId: users[1]._id,
        name: users[1].name,
        email: users[1].email,
        phone: '+1-555-1002',
        department: 'Sales',
        position: 'Sales Manager',
        hireDate: new Date('2021-03-20'),
        baseSalary: 85000,
        status: 'active',
        address: {
          street: '200 Sales St',
          city: 'Boston',
          state: 'MA',
          pincode: '02101',
        },
      },
      {
        employeeId: 'EMP-00003',
        userId: users[2]._id,
        name: users[2].name,
        email: users[2].email,
        phone: '+1-555-1003',
        department: 'Sales',
        position: 'Sales Representative',
        hireDate: new Date('2022-06-10'),
        baseSalary: 55000,
        status: 'active',
        address: {
          street: '300 Commerce Ave',
          city: 'Miami',
          state: 'FL',
          pincode: '33101',
        },
      },
      {
        employeeId: 'EMP-00004',
        userId: users[3]._id,
        name: users[3].name,
        email: users[3].email,
        phone: '+1-555-1004',
        department: 'Operations',
        position: 'Inventory Manager',
        hireDate: new Date('2021-09-01'),
        baseSalary: 65000,
        status: 'active',
        address: {
          street: '400 Warehouse Rd',
          city: 'Dallas',
          state: 'TX',
          pincode: '75201',
        },
      },
      {
        employeeId: 'EMP-00005',
        userId: users[4]._id,
        name: users[4].name,
        email: users[4].email,
        phone: '+1-555-1005',
        department: 'HR',
        position: 'HR Manager',
        hireDate: new Date('2020-11-15'),
        baseSalary: 75000,
        status: 'active',
        address: {
          street: '500 People Pkwy',
          city: 'Denver',
          state: 'CO',
          pincode: '80201',
        },
      },
    ]);
    console.log('✅ Created employees');

    // Create sample orders
    const sampleOrders = [
      {
        orderNumber: 'ORD-2024-00001',
        customerId: customers[0]._id,
        customerName: customers[0].name,
        customerEmail: customers[0].email,
        status: 'completed',
        orderDate: new Date('2025-11-01'),
        total: 5196,
        shippingAddress: customers[0].address,
        orderItems: [
          {
            productId: products[0]._id,
            productSku: products[0].sku,
            productName: products[0].name,
            quantity: 4,
            unitPrice: products[0].price,
            lineTotal: products[0].price * 4,
          },
        ],
        invoice: {
          invoiceNumber: 'INV-2024-00001',
          amount: 5196,
          status: 'paid',
          dueDate: new Date('2025-12-01'),
          paidDate: new Date('2025-11-15'),
          paymentMethod: 'Bank Transfer',
        },
        createdBy: users[2]._id,
        createdByName: users[2].name,
      },
      {
        orderNumber: 'ORD-2024-00002',
        customerId: customers[1]._id,
        customerName: customers[1].name,
        customerEmail: customers[1].email,
        status: 'processing',
        orderDate: new Date('2025-11-05'),
        total: 1745,
        shippingAddress: customers[1].address,
        orderItems: [
          {
            productId: products[0]._id,
            productSku: products[0].sku,
            productName: products[0].name,
            quantity: 1,
            unitPrice: products[0].price,
            lineTotal: products[0].price,
          },
          {
            productId: products[3]._id,
            productSku: products[3].sku,
            productName: products[3].name,
            quantity: 3,
            unitPrice: products[3].price,
            lineTotal: products[3].price * 3,
          },
        ],
        invoice: {
          invoiceNumber: 'INV-2024-00002',
          amount: 1745,
          status: 'pending',
          dueDate: new Date('2025-12-05'),
        },
        createdBy: users[2]._id,
        createdByName: users[2].name,
      },
      {
        orderNumber: 'ORD-2024-00003',
        customerId: customers[2]._id,
        customerName: customers[2].name,
        customerEmail: customers[2].email,
        status: 'shipped',
        orderDate: new Date('2025-11-08'),
        total: 3192,
        shippingAddress: customers[2].address,
        orderItems: [
          {
            productId: products[4]._id,
            productSku: products[4].sku,
            productName: products[4].name,
            quantity: 8,
            unitPrice: products[4].price,
            lineTotal: products[4].price * 8,
          },
        ],
        invoice: {
          invoiceNumber: 'INV-2024-00003',
          amount: 3192,
          status: 'pending',
          dueDate: new Date('2025-12-08'),
        },
        createdBy: users[1]._id,
        createdByName: users[1].name,
      },
    ];

    await Order.create(sampleOrders);
    console.log('✅ Created orders');

    // Update customer stats
    for (const customer of customers) {
      const customerOrders = sampleOrders.filter(
        order => String(order.customerId) === String(customer._id)
      );
      customer.totalOrders = customerOrders.length;
      customer.totalValue = customerOrders.reduce((sum, order) => sum + order.total, 0);
      customer.lastContact = new Date();
      await customer.save();
    }
    console.log('✅ Updated customer stats');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@flowgrid.com / admin123');
    console.log('Sales Manager: sales@flowgrid.com / sales123');
    console.log('Sales Rep: john@flowgrid.com / john123');
    console.log('Inventory: inventory@flowgrid.com / inventory123');
    console.log('HR: hr@flowgrid.com / hr123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
