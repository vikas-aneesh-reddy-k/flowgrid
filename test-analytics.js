// Test script for analytics data
const API_URL = 'http://localhost:5000/api';

async function testAnalyticsData() {
  try {
    // Login
    console.log('Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@flowgrid.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✓ Login successful\n');

    // Fetch all data needed for analytics
    console.log('Fetching analytics data...\n');

    // Orders
    const ordersResponse = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const ordersData = await ordersResponse.json();
    const orders = ordersData.data || [];
    console.log(`✓ Orders: ${orders.length}`);

    // Customers
    const customersResponse = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const customersData = await customersResponse.json();
    const customers = customersData.data || [];
    console.log(`✓ Customers: ${customers.length}`);

    // Employees
    const employeesResponse = await fetch(`${API_URL}/employees`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const employeesData = await employeesResponse.json();
    const employees = employeesData.data || [];
    console.log(`✓ Employees: ${employees.length}`);

    // Products
    const productsResponse = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const productsData = await productsResponse.json();
    const products = productsData.data || [];
    console.log(`✓ Products: ${products.length}\n`);

    // Calculate metrics
    console.log('Calculating metrics...\n');

    // YTD Revenue
    const currentYear = new Date().getFullYear();
    const ytdRevenue = orders
      .filter(o => new Date(o.orderDate).getFullYear() === currentYear)
      .reduce((sum, o) => sum + (o.total || 0), 0);
    console.log(`YTD Revenue: $${ytdRevenue.toLocaleString()}`);

    // Average Order Value
    const avgOrderValue = orders.length > 0 
      ? Math.round(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length)
      : 0;
    console.log(`Average Order Value: $${avgOrderValue.toLocaleString()}`);

    // Customer Retention
    const repeatCustomers = customers.filter(c => (c.totalOrders || 0) > 1).length;
    const retention = customers.length > 0 
      ? Math.round((repeatCustomers / customers.length) * 100)
      : 0;
    console.log(`Customer Retention: ${retention}%`);

    // Department Distribution
    const deptCounts = {};
    employees.filter(e => e.status === 'active').forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });
    console.log('\nDepartment Distribution:');
    Object.entries(deptCounts).forEach(([dept, count]) => {
      const percentage = Math.round((count / employees.length) * 100);
      console.log(`  ${dept}: ${count} employees (${percentage}%)`);
    });

    // Low Stock Products
    const lowStock = products.filter(p => p.stockStatus === 'low').length;
    console.log(`\nLow Stock Items: ${lowStock}`);

    console.log('\n✅ All analytics data calculated successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnalyticsData();
