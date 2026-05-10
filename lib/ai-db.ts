// lib/ai-db.ts - AI运营系统数据库操作
import { query } from './db'

// ===== 建表 =====
export async function initAITables() {
  const sqls = [
    // AI内容任务表
    `CREATE TABLE IF NOT EXISTS ai_content_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content_type ENUM('industry','local','case') NOT NULL COMMENT 'industry=行业知识 local=本地媒体 case=投放案例',
      keyword VARCHAR(200) DEFAULT NULL,
      keyword_id INT DEFAULT NULL,
      status ENUM('draft','pending_review','published','failed') DEFAULT 'draft',
      content LONGTEXT,
      summary TEXT,
      seo_keywords VARCHAR(500),
      cover_image VARCHAR(500),
      scheduled_at DATETIME,
      published_at DATETIME,
      ai_model VARCHAR(100),
      token_used INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_type (content_type),
      INDEX idx_scheduled (scheduled_at),
      INDEX idx_published (published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // AI内容日志表
    `CREATE TABLE IF NOT EXISTS ai_content_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT DEFAULT NULL,
      action VARCHAR(100) NOT NULL,
      message TEXT,
      metadata JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_task (task_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // 关键词库
    `CREATE TABLE IF NOT EXISTS keyword_bank (
      id INT AUTO_INCREMENT PRIMARY KEY,
      keyword VARCHAR(200) NOT NULL UNIQUE,
      search_intent ENUM('commercial','knowledge','comparison','local') DEFAULT 'knowledge',
      priority ENUM('high','medium','low') DEFAULT 'medium',
      status ENUM('active','paused','used') DEFAULT 'active',
      source VARCHAR(100) DEFAULT 'manual',
      category VARCHAR(100),
      monthly_search_volume INT DEFAULT 0,
      current_ranking INT DEFAULT NULL,
      target_ranking INT DEFAULT 10,
      content_count INT DEFAULT 0,
      last_generated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_priority (priority),
      INDEX idx_status (status),
      INDEX idx_intent (search_intent)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // 热点话题表
    `CREATE TABLE IF NOT EXISTS trend_topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      topic VARCHAR(300) NOT NULL,
      category ENUM('seasonal','festival','policy','hotspot') DEFAULT 'hotspot',
      source VARCHAR(100) DEFAULT 'ai_detect',
      status ENUM('pending','generated','published','ignored') DEFAULT 'pending',
      related_keywords JSON,
      ai_suggestion TEXT,
      content_id INT DEFAULT NULL,
      heat_score INT DEFAULT 0,
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // 线索评分表
    `CREATE TABLE IF NOT EXISTS lead_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      score_level ENUM('high','medium','low') DEFAULT 'low',
      score INT DEFAULT 0,
      behaviors JSON COMMENT '用户行为记录',
      ai_reason TEXT COMMENT 'AI判断理由',
      is_notified TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user (user_id),
      INDEX idx_level (score_level),
      INDEX idx_notified (is_notified)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // AI运营设置表
    `CREATE TABLE IF NOT EXISTS ai_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      description VARCHAR(500),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ]

  for (const sql of sqls) {
    try {
      await query(sql)
    } catch (e: any) {
      console.error(`AI table init error: ${e.message}`)
    }
  }

  // 插入默认设置
  const defaultSettings = [
    ['daily_content_count', '3', '每天发文数量'],
    ['content_ratio_industry', '50', '行业知识比例%'],
    ['content_ratio_local', '30', '本地媒体比例%'],
    ['content_ratio_case', '20', '投放案例比例%'],
    ['auto_publish', 'false', '是否自动发布（false=需人工审核）'],
    ['require_review', 'true', '是否要求人工审核'],
    ['content_schedule_1', '08:00', '第一次发布时间'],
    ['content_schedule_2', '13:00', '第二次发布时间'],
    ['content_schedule_3', '18:00', '第三次发布时间'],
    ['hot_topic_enabled', 'true', '热点追踪开关'],
    ['lead_scoring_enabled', 'true', '线索评分开关'],
    ['keyword_auto_generate', 'true', '自动生成关键词选题'],
  ]

  for (const [key, value, desc] of defaultSettings) {
    await query(
      'INSERT IGNORE INTO ai_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
      [key, value, desc]
    )
  }
}

// ===== AI内容任务操作 =====
export async function createContentTask(data: {
  title: string
  content_type: 'industry' | 'local' | 'case'
  keyword?: string
  keyword_id?: number
  scheduled_at?: string
}) {
  const r = await query(
    `INSERT INTO ai_content_tasks (title, content_type, keyword, keyword_id, status, scheduled_at)
     VALUES (?, ?, ?, ?, 'draft', ?)`,
    [data.title, data.content_type, data.keyword || null, data.keyword_id || null, data.scheduled_at || null]
  ) as any
  return r.insertId
}

export async function getContentTasks(status?: string, limit = 20) {
  let sql = 'SELECT * FROM ai_content_tasks'
  const params: any[] = []
  if (status) {
    sql += ' WHERE status = ?'
    params.push(status)
  }
  sql += ' ORDER BY created_at DESC LIMIT ?'
  params.push(limit)
  return query(sql, params)
}

export async function updateContentTask(id: number, data: any) {
  const sets: string[] = []
  const params: any[] = []
  for (const [k, v] of Object.entries(data)) {
    sets.push(`${k} = ?`)
    params.push(v)
  }
  params.push(id)
  return query(`UPDATE ai_content_tasks SET ${sets.join(', ')} WHERE id = ?`, params)
}

export async function getPendingPublishTasks() {
  return query(
    `SELECT * FROM ai_content_tasks 
     WHERE status IN ('pending_review') 
     AND scheduled_at IS NOT NULL 
     AND scheduled_at <= NOW()
     ORDER BY scheduled_at ASC`
  )
}

export async function getDailyTaskCount() {
  const r = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as count 
     FROM ai_content_tasks 
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date DESC`
  ) as any[]
  return r
}

export async function logContentAction(taskId: number | null, action: string, message: string, metadata?: any) {
  return query(
    'INSERT INTO ai_content_logs (task_id, action, message, metadata) VALUES (?, ?, ?, ?)',
    [taskId, action, message, metadata ? JSON.stringify(metadata) : null]
  )
}

// ===== 关键词操作 =====
export async function addKeyword(data: {
  keyword: string
  search_intent?: string
  priority?: string
  category?: string
  source?: string
}) {
  try {
    const r = await query(
      `INSERT INTO keyword_bank (keyword, search_intent, priority, category, source)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [data.keyword, data.search_intent || 'knowledge', data.priority || 'medium', data.category || null, data.source || 'manual']
    ) as any
    return r.insertId || r.affectedRows
  } catch (e: any) {
    console.error('Add keyword error:', e.message)
    return null
  }
}

export async function getKeywords(filters?: { status?: string; priority?: string; limit?: number }) {
  let sql = 'SELECT * FROM keyword_bank WHERE 1=1'
  const params: any[] = []
  if (filters?.status) { sql += ' AND status = ?'; params.push(filters.status) }
  if (filters?.priority) { sql += ' AND priority = ?'; params.push(filters.priority) }
  sql += ' ORDER BY priority ASC, monthly_search_volume DESC'
  sql += ' LIMIT ?'; params.push(filters?.limit || 100)
  return query(sql, params)
}

export async function getPendingKeywords() {
  return query(
    `SELECT * FROM keyword_bank 
     WHERE status = 'active' 
     ORDER BY priority ASC, monthly_search_volume DESC 
     LIMIT 100`
  )
}

// ===== 热点话题 =====
export async function createTrendTopic(data: {
  topic: string
  category?: string
  heat_score?: number
  related_keywords?: string[]
}) {
  const r = await query(
    `INSERT INTO trend_topics (topic, category, related_keywords, heat_score)
     VALUES (?, ?, ?, ?)`,
    [data.topic, data.category || 'hotspot', data.related_keywords ? JSON.stringify(data.related_keywords) : null, data.heat_score || 0]
  ) as any
  return r.insertId
}

export async function getTopics(limit = 20) {
  return query('SELECT * FROM trend_topics ORDER BY heat_score DESC, detected_at DESC LIMIT ?', [limit])
}

// ===== 线索评分 =====
export async function upsertLeadScore(data: {
  user_id: number
  score_level: 'high' | 'medium' | 'low'
  score: number
  behaviors: any
  ai_reason?: string
}) {
  return query(
    `INSERT INTO lead_scores (user_id, score_level, score, behaviors, ai_reason)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       score_level = VALUES(score_level),
       score = VALUES(score),
       behaviors = VALUES(behaviors),
       ai_reason = VALUES(ai_reason),
       updated_at = NOW()`,
    [data.user_id, data.score_level, data.score, JSON.stringify(data.behaviors), data.ai_reason || null]
  )
}

export async function getHighValueLeads() {
  return query(
    `SELECT ls.*, u.phone, u.name, u.company_name
     FROM lead_scores ls
     LEFT JOIN users u ON ls.user_id = u.id
     WHERE ls.score_level = 'high' AND ls.is_notified = 0
     ORDER BY ls.score DESC
     LIMIT 20`
  )
}

export async function markLeadNotified(userId: number) {
  return query('UPDATE lead_scores SET is_notified = 1 WHERE user_id = ?', [userId])
}

// ===== AI设置 =====
export async function getAISettings() {
  const rows = await query('SELECT setting_key, setting_value FROM ai_settings') as any[]
  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.setting_key] = row.setting_value
  }
  return settings
}

export async function updateAISetting(key: string, value: string) {
  return query(
    'INSERT INTO ai_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    [key, value, value]
  )
}

// ===== Dashboard统计 =====
export async function getAIDashboardStats() {
  const [todayTasks, totalKeywords, totalTopics, highLeads, publishedCount, pendingCount] = await Promise.all([
    query(`SELECT COUNT(*) as count FROM ai_content_tasks WHERE DATE(created_at) = CURDATE()`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM keyword_bank WHERE status = 'active'`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM trend_topics`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM lead_scores WHERE score_level = 'high' AND is_notified = 0`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM ai_content_tasks WHERE status = 'published'`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM ai_content_tasks WHERE status IN ('draft','pending_review')`) as Promise<any[]>,
  ])

  return {
    today_content: todayTasks[0]?.count || 0,
    total_keywords: totalKeywords[0]?.count || 0,
    total_topics: totalTopics[0]?.count || 0,
    high_value_leads: highLeads[0]?.count || 0,
    published_total: publishedCount[0]?.count || 0,
    pending_review: pendingCount[0]?.count || 0,
  }
}
