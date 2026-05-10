const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3307, user: 'ai_ads_user',
    password: 'Qhxn_jjp3864488', database: 'ai_ads'
  });

  console.log('=== Starting cleanup of test data ===\n');
  
  // Step 1: Delete finance records for test orders (order_id IN 1,2,3)
  const delFin = await conn.query('DELETE FROM finance WHERE order_id IN (1,2,3)');
  console.log('Deleted finance records:', delFin[0].affectedRows);
  
  // Step 2: Delete order items for test orders
  const delItems = await conn.query('DELETE FROM order_items WHERE order_id IN (1,2,3)');
  console.log('Deleted order_items:', delItems[0].affectedRows);
  
  // Step 3: Delete test orders
  const delOrders = await conn.query('DELETE FROM orders WHERE id IN (1,2,3)');
  console.log('Deleted orders:', delOrders[0].affectedRows);
  
  // Step 4: Delete media_assets for media from test suppliers (supplier_id IN 1,21,22,23,24,25)
  const delAssets = await conn.query(`
    DELETE ma FROM media_assets ma
    JOIN media m ON ma.media_id = m.id
    WHERE m.supplier_id IN (1,21,22,23,24,25)
  `);
  console.log('Deleted media_assets (from test suppliers):', delAssets[0].affectedRows);
  
  // Step 5: Delete media_points for media from test suppliers
  const delPoints = await conn.query(`
    DELETE mp FROM media_points mp
    JOIN media m ON mp.media_id = m.id
    WHERE m.supplier_id IN (1,21,22,23,24,25)
  `);
  console.log('Deleted media_points:', delPoints[0].affectedRows);
  
  // Step 6: Delete media from test suppliers
  const delMedia = await conn.query('DELETE FROM media WHERE supplier_id IN (1,21,22,23,24,25)');
  console.log('Deleted media (from test suppliers):', delMedia[0].affectedRows);
  
  // Step 7: Delete test suppliers (id IN 1,21,22,23,24,25)
  const delSuppliers = await conn.query('DELETE FROM suppliers WHERE id IN (1,21,22,23,24,25)');
  console.log('Deleted suppliers:', delSuppliers[0].affectedRows);
  
  // Step 8: Update supplier_applications reviewed_by to NULL for test reviewers
  const updApps1 = await conn.query('UPDATE supplier_applications SET reviewed_by = NULL WHERE reviewed_by IN (1,2,3,4,7)');
  console.log('Updated supplier_applications (cleared reviewed_by from test users):', updApps1[0].affectedRows);
  
  // Step 9: Delete supplier_applications from test users
  // supplier_applications that are from test users (by matching user_id through suppliers or directly)
  // These are apps with id 26,27,28,29,30 (测试/测试abc/阿斯顿)
  const delApps = await conn.query('DELETE FROM supplier_applications WHERE id IN (26,27,28,29,30)');
  console.log('Deleted test supplier_applications:', delApps[0].affectedRows);
  
  // Step 10: Delete test users
  const testUids = [1,2,3,4,7,27,28,29,30,31];
  const delUsers = await conn.query('DELETE FROM users WHERE id IN (?)', [testUids]);
  console.log('Deleted test users:', delUsers[0].affectedRows);
  
  // Verify remaining data
  console.log('\n=== Verification ===');
  const [users] = await conn.query('SELECT id, name, phone, role FROM users');
  console.log('Remaining users:');
  for (const u of users) console.log(`  id=${u.id} name=${u.name} phone=${u.phone} role=${u.role}`);
  
  const [suppliers] = await conn.query('SELECT id, company_name, status FROM suppliers');
  console.log('\nRemaining suppliers:');
  for (const s of suppliers) console.log(`  id=${s.id} company=${s.company_name} status=${s.status}`);
  
  const [media] = await conn.query('SELECT id, name, status, supplier_id FROM media');
  console.log('\nRemaining media:');
  for (const m of media) console.log(`  id=${m.id} name=${m.name} status=${m.status} supplier_id=${m.supplier_id}`);
  
  await conn.end();
}
main().catch(e => console.error('ERROR:', e.message));
