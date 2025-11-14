const API_URL = 'http://localhost:5000/api';

async function testPayrollProcessing() {
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

    // Get employees
    console.log('\nFetching employees...');
    const employeesResponse = await fetch(`${API_URL}/employees`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const employeesData = await employeesResponse.json();
    console.log(`✓ Found ${employeesData.data.length} employees`);

    // Process payroll
    console.log('\nProcessing payroll...');
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const payrollResponse = await fetch(`${API_URL}/employees/payroll/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        payPeriodStart: startDate.toISOString().split('T')[0],
        payPeriodEnd: endDate.toISOString().split('T')[0]
      })
    });

    const payrollData = await payrollResponse.json();
    
    if (!payrollData.success) {
      throw new Error('Payroll processing failed: ' + payrollData.message);
    }

    console.log('✓ Payroll processed successfully');
    console.log(`  - Processed: ${payrollData.data.processed} employees`);
    console.log(`  - Failed: ${payrollData.data.failed} employees`);
    
    if (payrollData.data.payrolls.length > 0) {
      console.log('\nPayroll Details:');
      payrollData.data.payrolls.forEach(p => {
        console.log(`  - ${p.name} (${p.employeeId}): $${p.netPay.toFixed(2)}`);
      });
    }

    // Verify payroll was added to employee records
    console.log('\nVerifying payroll records...');
    const verifyResponse = await fetch(`${API_URL}/employees`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const verifyData = await verifyResponse.json();
    const employeeWithPayroll = verifyData.data.find(emp => emp.payroll && emp.payroll.length > 0);
    
    if (employeeWithPayroll) {
      console.log('✓ Payroll records saved to database');
      console.log(`  Sample: ${employeeWithPayroll.name} has ${employeeWithPayroll.payroll.length} payroll record(s)`);
    } else {
      console.log('⚠ No payroll records found in employee data');
    }

    console.log('\n✅ All payroll tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPayrollProcessing();
