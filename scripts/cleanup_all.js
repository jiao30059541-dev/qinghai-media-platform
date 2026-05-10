const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3307, user: 'ai_ads_user',
    password: 'Qhxn_jjp3864488', database: 'ai_ads'
  });

  console.log('=== Full cleanup - keep only 焦建平 (id=5) ===\n');
  
  // Step 1: Delete finance records (all)
  await conn.query('DELETE FROM finance');
  console.log('Deleted finance');
  
  // Step 2: Delete order items
  await conn.query('DELETE FROM order_items');
  console.log('Deleted order_items');
  
  // Step 3: Delete orders
  await conn.query('DELETE FROM orders');
  console.log('Deleted orders');
  
  // Step 4: Delete media_assets
  await conn.query('DELETE FROM media_assets');
  console.log('Deleted media_assets');
  
  // Step 5: Delete media_points
  await conn.query('DELETE FROM media_points');
  console.log('Deleted media_points');
  
  // Step 6: Delete media
  await conn.query('DELETE FROM media');
  console.log('Deleted media');
  
  // Step 7: Delete suppliers (all)
  await conn.query('DELETE FROM suppliers');
  console.log('Deleted suppliers');
  
  // Step 8: Delete supplier_applications
  await conn.query('DELETE FROM supplier_applications');
  console.log('Deleted supplier_applications');
  
  // Step 9: Delete all users except 焦建平 (id=5)
  const [delUsers] = await conn.query("DELETE FROM users WHERE id != 5");
  console.log('Deleted users (except id=5): ' + delUsers.affectedRows);
  
  // Step 10: Clean other tables silently
  const tables = ['ab_tests', 'ab_test_variants', 'ab_test_assignments', 'ab_test_events', 
                  'admin_logs', 'ai_content_logs', 'ai_content_tasks', 'ai_settings',
                  'cases', 'keyword_bank', 'lead_scores', 'leads',
                  'recommendation_cache', 'recommendation_metrics', 'report_schedules',
                  'reports', 'settings', 'system_backups', 'system_health',
                  'system_logs', 'system_metrics', 'system_settings',
                  'trend_topics', 'user_behavior_metrics', 'user_behaviors',
                  'user_interests', 'performance_metrics'];
  for (const tbl of tables) {
    try {
      await conn.query('DELETE FROM ' + tbl);
    } catch(e) {}
  }

  // Verification
  console.log('\n=== Verification ===');
  const [users] = await conn.query('SELECT id, name, phone, role, company_name, email FROM users');
  console.log('Remaining users (' + users.length + '):');
  for (const u of users) {
    console.log('  id=' + u.id + ' name=' + u.name + ' phone=' + u.phone + ' role=' + u.role + 
      (u.company_name ? ' company=' + u.company_name : '') + (u.email ? ' email=' + u.email : ''));
  }
  
  const checks = ['suppliers', 'media', 'media_assets', 'media_points', 'orders', 'order_items', 'finance', 'supplier_applications'];
  for (const tbl of checks) {
    const [r] = await conn.query('SELECT COUNT(*) as cnt FROM ' + tbl);
    console.log(tbl + ': ' + r[0].cnt + ' rows');
  }
  
  await conn.end();
}
main().catch(e => console.error('ERROR:', e.message));
