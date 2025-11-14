const API_URL = 'http://localhost:5000/api';

async function testAnalytics() {
  try {
    // Login first
    console.log('Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@erp.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.token;
    console.log('✓ Login successful');

    // Test dashboard stats
    console.log('\nFetching dashboard stats...');
    const statsResponse = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const statsData = await statsResponse.json();
    if (!statsData.success) {
      throw new Error('Failed to fetch stats: ' + statsData.message);
    }

    console.log('✓ Dashboard stats retrieved');
    console.log('  Metrics:');
    console.log(`    - Total Revenue: $${statsData.data.metrics.totalRevenue.value.toFixed(2)}`);
    console.log(`    - Revenue Change: ${statsData.data.metrics.totalRevenue.change.toFixed(1)}%`);
    console.log(`    - Active Orders: ${statsData.data.metrics.activeOrders.value}`);
    console.log(`    - Inventory Value: $${statsData.data.metrics.inventoryValue.value.toFixed(2)}`);
    console.log(`    - Total Employees: ${statsData.data.metrics.totalEmployees.value}`);
    console.log(`  Monthly Revenue Data: ${statsData.data.monthlyRevenue.length} months`);

    // Test analytics with date range
    console.log('\nFetching analytics data...');
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    
    const analyticsResponse = await fetch(
      `${API_URL}/dashboard/analytics?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const analyticsData = await analyticsResponse.json();
    if (!analyticsData.success) {
      throw new Error('Failed to fetch analytics: ' + analyticsData.message);
    }

    console.log('✓ Analytics data retrieved');
    console.log('  Orders by Status:');
    analyticsData.data.ordersByStatus.forEach(status => {
      console.log(`    - ${status._id}: ${status.count} orders ($${status.total.toFixed(2)})`);
    });

    console.log('  Top Products:');
    analyticsData.data.topProducts.slice(0, 5).forEach((product, i) => {
      console.log(`    ${i + 1}. ${product.productName}: ${product.totalQuantity} units ($${product.totalRevenue.toFixed(2)})`);
    });

    console.log('  Department Stats:');
    analyticsData.data.departmentStats.forEach(dept => {
      console.log(`    - ${dept._id}: ${dept.count} employees ($${dept.totalSalary.toFixed(2)} total salary)`);
    });

    console.log('  Top Customers:');
    analyticsData.data.topCustomers.slice(0, 5).forEach((customer, i) => {
      console.log(`    ${i + 1}. ${customer.name}: $${customer.totalValue.toFixed(2)}`);
    });

    console.log('\n✅ All analytics tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAnalytics();
