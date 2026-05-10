const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3307, user: 'ai_ads_user',
    password: 'Qhxn_jjp3864488', database: 'ai_ads'
  });

  // Check which test users have media / orders / supplier records
  // Test user IDs: 1,2,3,4,7,27,28,29,30,31
  const testUids = [1,2,3,4,7,27,28,29,30,31];
  
  // Supplier IDs from test users: 1 (user_id=2), 21 (user_id=27), 22(user_id=28), 23(user_id=29), 24(user_id=30), 25(user_id=31)
  // Supplier ID 1 (青海传媒公司, user_id=2) - has media 1-6 attached, has orders
  
  // Check order items linked to media from test suppliers
  const [orderItems] = await conn.query(`
    SELECT oi.id, oi.order_id, oi.media_id, m.name as media_name, m.supplier_id
    FROM order_items oi
    JOIN media m ON oi.media_id = m.id
    WHERE m.supplier_id IN (1,21,22,23,24,25)
  `);
  console.log('Order items linked to test supplier media:', orderItems.length);
  for (const item of orderItems) console.log(JSON.stringify(item));
  
  // Check orders from test users
  const [orders] = await conn.query('SELECT id, user_id, total_price, status FROM orders WHERE user_id IN (?)', [testUids]);
  console.log('\nOrders from test users:', orders.length);
  for (const o of orders) console.log(JSON.stringify(o));
  
  // Check finance linked to these orders
  const orderIds = orders.map(o => o.id);
  if (orderIds.length > 0) {
    const [fin] = await conn.query('SELECT * FROM finance WHERE order_id IN (?)', [orderIds]);
    console.log('\nFinance records:', fin.length);
    for (const f of fin) console.log(JSON.stringify(f));
  }
  
  // Check media_assets for test supplier media (supplier_id IN 1,21,22,23,24,25)
  const [assets] = await conn.query(`
    SELECT ma.id, ma.media_id, m.supplier_id
    FROM media_assets ma
    JOIN media m ON ma.media_id = m.id
    WHERE m.supplier_id IN (1,21,22,23,24,25)
  `);
  console.log('\nMedia assets from test suppliers:', assets.length);
  
  // Now check which supplier_applications are from test users
  // User id 1-4,7,27,28,29,30,31
  // supplier_applications table has reviewed_by = 1 (test user reviewed)
  const [appsReviewed] = await conn.query('SELECT id, company_name, reviewed_by FROM supplier_applications WHERE reviewed_by IN (?)', [[1,2,3,4,7]]);
  console.log('\nSupplier apps reviewed by test users:', appsReviewed.length);
  for (const a of appsReviewed) console.log(JSON.stringify(a));
  
  await conn.end();
}
main().catch(e => console.error('ERROR:', e.message));
