// Test script for lead/customer creation
const API_URL = 'http://localhost:5000/api';

async function testLeadCreation() {
  try {
    // First, login to get a token
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
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.token;
    console.log('✓ Login successful');

    // Create a new lead/customer
    console.log('\nCreating new lead...');
    const leadData = {
      name: 'Test Lead',
      email: 'test.lead@example.com',
      phone: '+1-555-7777',
      company: 'Test Company Inc',
      segment: 'SMB',
      status: 'active',
      address: {
        street: '456 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      },
    };

    const createResponse = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    const createData = await createResponse.json();
    
    if (!createData.success) {
      throw new Error('Lead creation failed: ' + createData.message);
    }

    console.log('✓ Lead created successfully!');
    console.log('Name:', createData.data.name);
    console.log('Email:', createData.data.email);
    console.log('Company:', createData.data.company);
    console.log('Segment:', createData.data.segment);
    console.log('Status:', createData.data.status);

    // Fetch all customers to verify
    console.log('\nFetching all customers...');
    const listResponse = await fetch(`${API_URL}/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const listData = await listResponse.json();
    console.log(`✓ Total customers: ${listData.data.length}`);
    
    // Count active leads (customers with 0 orders)
    const activeLeads = listData.data.filter(c => c.status === 'active' && c.totalOrders === 0);
    console.log(`✓ Active leads: ${activeLeads.length}`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLeadCreation();
