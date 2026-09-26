const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- STARTING API TESTS ---');
  let managerToken, staffToken;

  const ts = Date.now();
  const mgrEmail = `manager_${ts}@test.com`;
  const staffEmail = `staff_${ts}@test.com`;

  // 1. SIGNUP & LOGIN
  let res = await request('POST', '/auth/signup', { name: 'Manager User', email: mgrEmail, password: 'password123', role: 'manager' });
  assert.strictEqual(res.status, 201, 'Manager signup failed');

  res = await request('POST', '/auth/signup', { name: 'Staff User', email: staffEmail, password: 'password123', role: 'staff' });
  assert.strictEqual(res.status, 201, 'Staff signup failed');

  res = await request('POST', '/auth/login', { email: mgrEmail, password: 'password123' });
  assert.strictEqual(res.status, 200, 'Manager login failed');
  managerToken = res.data.data.accessToken;

  console.log('[PASS] Authentication flow working.');

  // 2. CATEGORY & WAREHOUSE
  res = await request('POST', '/categories', { name: `Electronics_${ts}` }, managerToken);
  assert.strictEqual(res.status, 201);
  const categoryId = res.data.data._id;

  res = await request('POST', '/warehouses', { name: `Main WH_${ts}`, code: `WH1_${ts}`, locations: ['Rack A', 'Rack B'] }, managerToken);
  assert.strictEqual(res.status, 201);
  const wh1 = res.data.data._id;

  res = await request('POST', '/warehouses', { name: `Secondary WH_${ts}`, code: `WH2_${ts}`, locations: ['Rack C'] }, managerToken);
  const wh2 = res.data.data._id;

  console.log('[PASS] Category and Warehouses created.');

  // 3. PRODUCT & INITIAL STOCK
  res = await request('POST', '/products', {
    name: `iPhone 15_${ts}`, category: categoryId, unitOfMeasure: 'pcs',
    reorderPoint: 10, reorderQty: 20, initialStock: 100, warehouse: wh1
  }, managerToken);
  assert.strictEqual(res.status, 201);
  const productId = res.data.data._id;

  // Verify Stock Level
  res = await request('GET', `/products/${productId}/stock`, null, managerToken);
  const stockLevels = res.data.data.stockLevels;
  assert.strictEqual(stockLevels.length, 1);
  assert.strictEqual(stockLevels[0].quantity, 100);

  // Verify Ledger
  res = await request('GET', `/ledger?product=${productId}`, null, managerToken);
  const ledgerEntries = res.data.data.ledger;
  assert.strictEqual(ledgerEntries.length, 1);
  assert.strictEqual(ledgerEntries[0].change, 100);

  console.log('[PASS] Product creation with initial stock and ledger entry.');

  // 4. RECEIPT
  res = await request('POST', '/receipts', {
    supplierName: 'Apple', warehouse: wh1, lines: [{ product: productId, expectedQty: 50 }]
  }, managerToken);
  assert.strictEqual(res.status, 201);
  const receiptId = res.data.data._id;

  // Ensure stock is still 100
  res = await request('GET', `/products/${productId}/stock`, null, managerToken);
  assert.strictEqual(res.data.data.stockLevels[0].quantity, 100);

  // Validate Receipt
  res = await request('PATCH', `/receipts/${receiptId}/status`, {
    status: 'done', lines: [{ product: productId, receivedQty: 50 }]
  }, managerToken);
  assert.strictEqual(res.status, 200);

  // Verify stock increased
  res = await request('GET', `/products/${productId}/stock`, null, managerToken);
  const stockAfterReceipt = res.data.data.stockLevels.find(s => s.warehouse._id === wh1).quantity;
  assert.strictEqual(stockAfterReceipt, 150);

  // Ensure double-validation fails
  res = await request('PATCH', `/receipts/${receiptId}/status`, { status: 'done' }, managerToken);
  assert.strictEqual(res.status, 400);

  console.log('[PASS] Receipt transaction verified (stock increased).');

  // 5. DELIVERY ORDER
  res = await request('POST', '/delivery-orders', {
    customerName: 'John', warehouse: wh1, lines: [{ product: productId, orderedQty: 30 }]
  }, managerToken);
  const deliveryId = res.data.data._id;

  res = await request('PATCH', `/delivery-orders/${deliveryId}/status`, {
    status: 'done', lines: [{ product: productId, pickedQty: 30 }]
  }, managerToken);
  assert.strictEqual(res.status, 200);

  res = await request('GET', `/products/${productId}/stock`, null, managerToken);
  const stockAfterDelivery = res.data.data.stockLevels.find(s => s.warehouse._id === wh1).quantity;
  assert.strictEqual(stockAfterDelivery, 120);

  // Insufficient stock test
  res = await request('POST', '/delivery-orders', {
    customerName: 'Fail', warehouse: wh1, lines: [{ product: productId, orderedQty: 200 }]
  }, managerToken);
  const failDeliveryId = res.data.data._id;

  res = await request('PATCH', `/delivery-orders/${failDeliveryId}/status`, {
    status: 'done', lines: [{ product: productId, pickedQty: 200 }]
  }, managerToken);
  assert.strictEqual(res.status, 409); // Conflict - Insufficient stock

  console.log('[PASS] Delivery Order transaction verified (stock decreased, prevents negative).');

  // 6. INTERNAL TRANSFER
  res = await request('POST', '/transfers', {
    product: productId, quantity: 20,
    from: { warehouse: wh1, location: 'Default' },
    to: { warehouse: wh2, location: 'Rack C' }
  }, managerToken);
  const transferId = res.data.data._id;

  res = await request('PATCH', `/transfers/${transferId}/status`, { status: 'done' }, managerToken);
  assert.strictEqual(res.status, 200);

  res = await request('GET', `/products/${productId}/stock`, null, managerToken);
  const s1 = res.data.data.stockLevels.find(s => s.warehouse._id === wh1).quantity;
  const s2 = res.data.data.stockLevels.find(s => s.warehouse._id === wh2).quantity;
  
  assert.strictEqual(s1, 100);
  assert.strictEqual(s2, 20);

  console.log('[PASS] Internal Transfer transaction verified.');

  // 7. STOCK ADJUSTMENT
  res = await request('POST', '/adjustments', {
    product: productId, warehouse: wh1, location: 'Default', countedQty: 95, reason: 'Damaged'
  }, managerToken);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.data.difference, -5);

  res = await request('GET', `/products/${productId}/stock`, null, managerToken);
  const s1_adj = res.data.data.stockLevels.find(s => s.warehouse._id === wh1).quantity;
  assert.strictEqual(s1_adj, 95);

  // 8. DASHBOARD & PROFILE
  res = await request('GET', '/profile', null, managerToken);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.data.email, mgrEmail);

  res = await request('GET', '/dashboard/kpis', null, managerToken);
  assert.strictEqual(res.status, 200);

  console.log('[PASS] Profile and Dashboard endpoints verified.');

  // 9. ROLE AUTHORIZATION & VALIDATION
  // Staff user trying to create warehouse should fail (403)
  res = await request('POST', '/auth/login', { email: staffEmail, password: 'password123' });
  staffToken = res.data.data.accessToken;

  res = await request('POST', '/warehouses', { name: 'Unauthorized WH', code: 'WH3' }, staffToken);
  assert.strictEqual(res.status, 403);

  console.log('[PASS] Role authorization (RBAC) verified.');

  // 10. PRODUCT SOFT DELETE
  res = await request('DELETE', `/products/${productId}`, null, managerToken);
  assert.strictEqual(res.status, 200);

  // GET on deactivated product must return 404
  res = await request('GET', `/products/${productId}`, null, managerToken);
  assert.strictEqual(res.status, 404);

  console.log('[PASS] Product soft delete verified (isActive = false, GET returns 404).');

  // 11. DUPLICATE STATUS OPERATIONS
  // Attempting to done a transfer again should fail
  res = await request('PATCH', `/transfers/${transferId}/status`, { status: 'done' }, managerToken);
  assert.strictEqual(res.status, 400);

  // Attempting to done a delivery order again should fail
  res = await request('PATCH', `/delivery-orders/${deliveryId}/status`, { status: 'done' }, managerToken);
  assert.strictEqual(res.status, 400);

  console.log('[PASS] Duplicate status operations correctly prevented.');

  console.log('--- ALL TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

