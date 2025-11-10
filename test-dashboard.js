// Test dashboard API endpoint
const API_URL = 'http://localhost:5000';

async function testDashboard() {
  console.log('Testing dashboard API...\n');
  
  try {
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@flowgrid.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // Test dashboard stats
    console.log('2. Fetching dashboard stats...');
    const statsResponse = await fetch(`${API_URL}/api/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Dashboard stats received:');
      console.log(JSON.stringify(statsData, null, 2));
    } else {
      console.log('❌ Dashboard stats failed:', statsData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboard();
