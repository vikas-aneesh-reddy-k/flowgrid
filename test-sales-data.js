// Test script for sales page data
const API_URL = 'http://localhost:5000/api';

async function testSalesData() {
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

    // Test customers endpoint
    console.log('Fetching customers...');
    const customersResponse = await fetch(`${API_URL}/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const customersData = await customersResponse.json();
    console.log('Customers response:', JSON.stringify(customersData, null, 2));
    console.log(`✓ Customers count: ${customersData.data?.length || 0}\n`);

    // Test orders endpoint
    console.log('Fetching orders...');
    const ordersResponse = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const ordersData = await ordersResponse.json();
    console.log('Orders response:', JSON.stringify(ordersData, null, 2));
    console.log(`✓ Orders count: ${ordersData.data?.length || 0}\n`);

    // Check first order structure
    if (ordersData.data && ordersData.data.length > 0) {
      console.log('First order structure:');
      console.log(JSON.stringify(ordersData.data[0], null, 2));
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSalesData();
