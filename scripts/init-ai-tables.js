// scripts/init-ai-tables.js - 初始化AI运营系统数据库
const { initAITables } = require('../lib/ai-db')

async function main() {
  console.log("Initializing AI system tables...")
  await initAITables()
  console.log("All tables created successfully!")
  process.exit(0)
}

main().catch(e => {
  console.error("Failed:", e)
  process.exit(1)
})
