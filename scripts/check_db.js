const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3307, user: 'ai_ads_user',
    password: 'Qhxn_jjp3864488', database: 'ai_ads'
  });
  
  // Users table - full
  const [users] = await conn.query('SELECT id, name, phone, role, email, company_name, created_at FROM users');
  console.log('=== USERS table (' + users.length + ' rows) ===');
  for (const u of users) console.log(JSON.stringify(u));
  
  // Suppliers table
  const [suppliers] = await conn.query('SELECT * FROM suppliers');
  console.log('\n=== SUPPLIERS table (' + suppliers.length + ' rows) ===');
  for (const s of suppliers) console.log(JSON.stringify(s));
  
  // Media table
  const [media] = await conn.query('SELECT id, name, city, status, supplier_id, created_at FROM media');
  console.log('\n=== MEDIA table (' + media.length + ' rows) ===');
  for (const m of media) console.log(JSON.stringify(m));
  
  // Supplier applications table
  const [apps] = await conn.query('SELECT * FROM supplier_applications');
  console.log('\n=== SUPPLIER_APPLICATIONS table (' + apps.length + ' rows) ===');
  for (const a of apps) console.log(JSON.stringify(a));
  
  // Orders table
  const [orders] = await conn.query('SELECT id, user_id, total_price, status, created_at FROM orders');
  console.log('\n=== ORDERS table (' + orders.length + ' rows) ===');
  for (const o of orders) console.log(JSON.stringify(o));
  
  // Media_assets
  const [assets] = await conn.query('SELECT id, media_id, type, url FROM media_assets');
  console.log('\n=== MEDIA_ASSETS table (' + assets.length + ' rows) ===');
  for (const a of assets) console.log(JSON.stringify(a));
  
  // Finance
  const [fin] = await conn.query('SELECT * FROM finance');
  console.log('\n=== FINANCE table (' + fin.length + ' rows) ===');
  for (const f of fin) console.log(JSON.stringify(f));
  
  // Order Items
  const [items] = await conn.query('SELECT * FROM order_items');
  console.log('\n=== ORDER_ITEMS table (' + items.length + ' rows) ===');
  for (const i of items) console.log(JSON.stringify(i));
  
  await conn.end();
}
main().catch(e => console.error('ERROR:', e.message));
