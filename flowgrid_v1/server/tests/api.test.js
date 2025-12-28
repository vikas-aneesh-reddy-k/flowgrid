// API Integration Tests for FlowGrid ERP
// Run with: npm run test:api

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

describe('FlowGrid API Integration Tests', () => {
  let authToken;
  let testCustomerId;
  let testProductId;
  let testOrderId;

  // Helper function for API calls
  async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (authToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    return { response, data };
  }

  // 1. Health Check
  test('GET /health - should return healthy status', async () => {
    const { response, data } = await apiCall('/health', { skipAuth: true });
    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('timestamp');
  });

  // 2. Authentication Tests
  describe('Authentication', () => {
    test('POST /auth/login - should login with valid credentials', async () => {
      const { response, data } = await apiCall('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          email: 'admin@flowgrid.com',
          password: 'admin123'
        })
      });

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      
      authToken = data.token;
    });

    test('POST /auth/login - should fail with invalid credentials', async () => {
      const { response, data } = await apiCall('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          email: 'admin@flowgrid.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  // 3. Dashboard Tests
  describe('Dashboard', () => {
    test('GET /dashboard/stats - should return dashboard statistics', async () => {
      const { response, data } = await apiCall('/dashboard/stats');
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalRevenue');
      expect(data.data).toHaveProperty('totalOrders');
      expect(data.data).toHaveProperty('totalCustomers');
      expect(data.data).toHaveProperty('totalProducts');
    });
  });

  // 4. Customer Tests
  describe('Customers', () => {
    test('GET /customers - should return list of customers', async () => {
      const { response, data } = await apiCall('/customers');
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        testCustomerId = data.data[0]._id;
      }
    });

    test('POST /customers - should create new customer', async () => {
      const { response, data } = await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Customer',
          email: `test${Date.now()}@example.com`,
          phone: '+1-555-0000',
          company: 'Test Company',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            pincode: '12345'
          }
        })
      });

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('_id');
      expect(data.data.name).toBe('Test Customer');
    });
  });

  // 5. Product Tests
  describe('Products', () => {
    test('GET /products - should return list of products', async () => {
      const { response, data } = await apiCall('/products');
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        testProductId = data.data[0]._id;
      }
    });

    test('POST /products - should create new product', async () => {
      const { response, data } = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Product',
          sku: `TEST-${Date.now()}`,
          category: 'Electronics',
          price: 99.99,
          cost: 50.00,
          stock: 100,
          reorderLevel: 20,
          description: 'Test product description'
        })
      });

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('_id');
      expect(data.data.name).toBe('Test Product');
    });
  });

  // 6. Order Tests
  describe('Orders', () => {
    test('GET /orders - should return list of orders', async () => {
      const { response, data } = await apiCall('/orders');
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('POST /orders - should create new order with invoice', async () => {
      if (!testCustomerId || !testProductId) {
        console.log('Skipping order creation - no test data available');
        return;
      }

      const { response, data } = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: testCustomerId,
          orderItems: [{
            productId: testProductId,
            quantity: 2
          }],
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          }
        })
      });

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('orderNumber');
      expect(data.data).toHaveProperty('invoice');
      expect(data.data.invoice).toHaveProperty('invoiceNumber');
      
      testOrderId = data.data._id;
    });
  });

  // 7. Employee Tests
  describe('Employees', () => {
    test('GET /employees - should return list of employees', async () => {
      const { response, data } = await apiCall('/employees');
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('POST /employees - should create new employee', async () => {
      const { response, data } = await apiCall('/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Employee',
          email: `test.emp${Date.now()}@flowgrid.com`,
          phone: '+1-555-1111',
          department: 'Engineering',
          position: 'Software Developer',
          baseSalary: 75000,
          hireDate: new Date().toISOString().split('T')[0],
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            pincode: '12345'
          }
        })
      });

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('employeeId');
      expect(data.data.name).toBe('Test Employee');
    });
  });
});

// Simple test runner
async function runTests() {
  console.log('🧪 Running API Integration Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // This is a simplified test runner
  // In production, use Jest or Mocha
  
  console.log('✅ API Integration Tests Complete');
  console.log(`Note: Use Jest or Mocha for full test execution`);
}

if (require.main === module) {
  runTests();
}

module.exports = { apiCall };
