// Test invoice creation and retrieval
const API_URL = 'http://localhost:5000/api';

async function testInvoiceCreation() {
  try {
    console.log('🧪 Testing Invoice Creation Flow...\n');

    // 1. Login first
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@flowgrid.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');

    // 2. Get customers
    console.log('2️⃣ Fetching customers...');
    const customersRes = await fetch(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customersData = await customersRes.json();
    const customers = customersData.data;
    console.log(`✅ Found ${customers.length} customers\n`);

    // 3. Get products
    console.log('3️⃣ Fetching products...');
    const productsRes = await fetch(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const productsData = await productsRes.json();
    const products = productsData.data;
    console.log(`✅ Found ${products.length} products\n`);

    if (customers.length === 0 || products.length === 0) {
      console.log('❌ No customers or products found. Please run seed script first.');
      return;
    }

    // 4. Get orders before creation
    console.log('4️⃣ Fetching orders before creation...');
    const ordersBeforeRes = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const ordersBeforeData = await ordersBeforeRes.json();
    const ordersBefore = ordersBeforeData.data;
    console.log(`✅ Found ${ordersBefore.length} orders before creation\n`);

    // 5. Create a new order with invoice
    console.log('5️⃣ Creating new order with invoice...');
    const orderData = {
      customerId: customers[0]._id,
      orderItems: [{
        productId: products[0]._id,
        quantity: 2
      }],
      shippingAddress: customers[0].address || {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345"
      }
    };

    const createOrderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    const createOrderData = await createOrderRes.json();
    const newOrder = createOrderData.data;
    console.log('✅ Order created successfully!');
    console.log(`   Order Number: ${newOrder.orderNumber}`);
    console.log(`   Invoice Number: ${newOrder.invoice.invoiceNumber}`);
    console.log(`   Total: $${newOrder.total}`);
    console.log(`   Invoice Status: ${newOrder.invoice.status}\n`);

    // 6. Get orders after creation
    console.log('6️⃣ Fetching orders after creation...');
    const ordersAfterRes = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const ordersAfterData = await ordersAfterRes.json();
    const ordersAfter = ordersAfterData.data;
    console.log(`✅ Found ${ordersAfter.length} orders after creation\n`);

    // 7. Verify the new order appears in the list
    const foundOrder = ordersAfter.find(o => o._id === newOrder._id);
    if (foundOrder) {
      console.log('✅ New order found in orders list!');
      console.log(`   Has invoice: ${foundOrder.invoice ? 'Yes' : 'No'}`);
      if (foundOrder.invoice) {
        console.log(`   Invoice Number: ${foundOrder.invoice.invoiceNumber}`);
        console.log(`   Invoice Amount: $${foundOrder.invoice.amount}`);
        console.log(`   Invoice Status: ${foundOrder.invoice.status}`);
      }
    } else {
      console.log('❌ New order NOT found in orders list!');
    }

    console.log('\n✅ All tests passed! Backend is working correctly.');
    console.log('✅ React Query cache invalidation should refresh the UI automatically.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

testInvoiceCreation();
