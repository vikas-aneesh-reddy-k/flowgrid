// Test script for employee creation
const API_URL = 'http://localhost:5000/api';

async function testEmployeeCreation() {
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

    // Create a new employee
    console.log('\nCreating new employee...');
    const employeeData = {
      name: 'Test Employee',
      email: 'test.employee@flowgrid.com',
      phone: '+1-555-9999',
      department: 'Engineering',
      position: 'Software Developer',
      baseSalary: 75000,
      hireDate: new Date().toISOString().split('T')[0],
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TC',
        pincode: '12345',
      },
    };

    const createResponse = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(employeeData),
    });

    const createData = await createResponse.json();
    
    if (!createData.success) {
      throw new Error('Employee creation failed: ' + createData.message);
    }

    console.log('✓ Employee created successfully!');
    console.log('Employee ID:', createData.data.employeeId);
    console.log('Name:', createData.data.name);
    console.log('Email:', createData.data.email);
    console.log('Department:', createData.data.department);
    console.log('Position:', createData.data.position);
    console.log('Base Salary:', createData.data.baseSalary);

    // Fetch all employees to verify
    console.log('\nFetching all employees...');
    const listResponse = await fetch(`${API_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const listData = await listResponse.json();
    console.log(`✓ Total employees: ${listData.data.length}`);
    console.log('Latest employee:', listData.data[0].name);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmployeeCreation();
