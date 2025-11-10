// Quick test to check if backend is running
const API_URL = 'http://localhost:5000';

async function testConnection() {
  console.log('Testing backend connection...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test login endpoint
    console.log('\n2. Testing login endpoint...');
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
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', loginData.token?.substring(0, 20) + '...');
      console.log('User:', loginData.user);
    } else {
      console.log('❌ Login failed:', loginData);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. MongoDB is running');
    console.log('   2. Backend server is running (npm run dev:server)');
    console.log('   3. Database is seeded (npm run server:seed)');
  }
}

testConnection();
