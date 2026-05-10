const mysql = require("mysql2/promise");
const fs = require("fs");
const pw = fs.readFileSync("/opt/qinghai-media-platform/.env.local","utf-8").match(/DB_PASSWORD=(\S+)/)?.[1] || "";

async function main() {
  const conn = await mysql.createConnection({
    host: "localhost", port: 3307, user: "ai_ads_user",
    password: pw, database: "ai_ads"
  });

  const [result] = await conn.execute(
    "UPDATE ai_content_tasks SET status = 'published', published_at = NOW() WHERE status = 'draft'"
  );
  console.log("Published " + result.affectedRows + " draft articles");

  const [r2] = await conn.execute(
    "UPDATE ai_content_tasks SET published_at = NOW() WHERE published_at IS NULL AND status = 'published'"
  );
  console.log("Fixed published_at for " + r2.affectedRows + " articles");

  const [byType] = await conn.execute(
    "SELECT content_type, COUNT(*) as c FROM ai_content_tasks WHERE status='published' GROUP BY content_type"
  );
  console.log("\nPublished by type:");
  byType.forEach(r => console.log("  " + r.content_type + ": " + r.c));

  const [all] = await conn.execute("SELECT COUNT(*) as c FROM ai_content_tasks WHERE status='published'");
  console.log("Total published: " + all[0].c);

  const [recent] = await conn.execute(
    "SELECT id, title, content_type, published_at FROM ai_content_tasks WHERE status='published' ORDER BY published_at DESC LIMIT 5"
  );
  console.log("\nRecent 5:");
  recent.forEach(r => console.log("  [" + r.content_type + "] #" + r.id + " " + r.title.substring(0, 50) + " - " + r.published_at));

  await conn.end();
}
main().catch(e => console.log("Error:", e.message));
