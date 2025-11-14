const API_URL = 'http://localhost:5000/api';

async function testCustomerDetails() {
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

    // Get all customers
    console.log('\nFetching customers...');
    const customersResponse = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const customersData = await customersResponse.json();
    if (!customersData.success) {
      throw new Error('Failed to fetch customers: ' + customersData.message);
    }

    console.log(`✓ Found ${customersData.data.length} customers`);
    
    if (customersData.data.length === 0) {
      console.log('⚠ No customers in database. Please run seed script first.');
      return;
    }

    // Display customer list
    console.log('\nCustomer List:');
    customersData.data.slice(0, 5).forEach((customer, i) => {
      console.log(`  ${i + 1}. ${customer.name}`);
      console.log(`     Email: ${customer.email}`);
      console.log(`     Status: ${customer.status}`);
      console.log(`     Company: ${customer.company || 'N/A'}`);
      console.log(`     Total Value: $${customer.totalValue.toFixed(2)}`);
      console.log(`     Total Orders: ${customer.totalOrders}`);
      console.log('');
    });

    // Get details for first customer
    const firstCustomer = customersData.data[0];
    console.log(`\nFetching details for: ${firstCustomer.name}...`);
    
    const detailsResponse = await fetch(`${API_URL}/customers/${firstCustomer._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const detailsData = await detailsResponse.json();
    if (!detailsData.success) {
      throw new Error('Failed to fetch customer details: ' + detailsData.message);
    }

    console.log('✓ Customer details retrieved');
    const customer = detailsData.data;
    console.log('\nDetailed Information:');
    console.log(`  Name: ${customer.name}`);
    console.log(`  Email: ${customer.email}`);
    console.log(`  Phone: ${customer.phone}`);
    console.log(`  Status: ${customer.status}`);
    console.log(`  Segment: ${customer.segment}`);
    if (customer.company) {
      console.log(`  Company: ${customer.company}`);
    }
    if (customer.address) {
      console.log(`  Address: ${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`);
    }
    console.log(`  Total Value: $${customer.totalValue.toFixed(2)}`);
    console.log(`  Total Orders: ${customer.totalOrders}`);
    console.log(`  Customer Since: ${new Date(customer.createdAt).toLocaleDateString()}`);
    if (customer.lastContact) {
      console.log(`  Last Contact: ${new Date(customer.lastContact).toLocaleDateString()}`);
    }
    if (customer.notes) {
      console.log(`  Notes: ${customer.notes}`);
    }

    // Get orders for this customer
    console.log('\nFetching customer orders...');
    const ordersResponse = await fetch(`${API_URL}/orders?customerId=${firstCustomer._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const ordersData = await ordersResponse.json();
    if (!ordersData.success) {
      throw new Error('Failed to fetch orders: ' + ordersData.message);
    }

    console.log(`✓ Found ${ordersData.data.length} orders for this customer`);
    if (ordersData.data.length > 0) {
      console.log('\nOrder History:');
      ordersData.data.forEach((order, i) => {
        console.log(`  ${i + 1}. ${order.orderId}`);
        console.log(`     Date: ${new Date(order.orderDate).toLocaleDateString()}`);
        console.log(`     Total: $${order.total.toFixed(2)}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Items: ${order.orderItems.length}`);
        console.log('');
      });
    }

    console.log('✅ All customer details tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCustomerDetails();
