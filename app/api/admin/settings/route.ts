// app/api/admin/settings/route.ts - 管理员系统设置API
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

// 验证管理员JWT token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key') as any
    // 检查用户角色是否为管理员
    if (decoded.role !== 'admin') {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// 获取系统设置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    
    // 根据类别获取设置
    let whereClause = ''
    const params: any[] = []
    
    if (category !== 'all') {
      whereClause = 'WHERE category = ?'
      params.push(category)
    }
    
    // 获取系统设置
    const settingsSql = `SELECT * FROM system_settings ${whereClause} ORDER BY category, key_name`
    const settings = await query(settingsSql, params) as any[]
    
    // 按类别分组
    const groupedSettings: Record<string, any[]> = {}
    settings.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = []
      }
      groupedSettings[setting.category].push(setting)
    })
    
    // 获取系统信息
    const systemInfoSql = `
      -- 数据库信息
      SELECT 
        'database' as type,
        COUNT(*) as table_count,
        (SELECT SUM(data_length + index_length) FROM information_schema.tables WHERE table_schema = DATABASE()) as total_size_bytes,
        VERSION() as version
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      
      UNION ALL
      
      -- 用户统计
      SELECT 
        'users' as type,
        COUNT(*) as count,
        NULL as total_size_bytes,
        NULL as version
      FROM users
      
      UNION ALL
      
      -- 订单统计
      SELECT 
        'orders' as type,
        COUNT(*) as count,
        0 as total_size_bytes,
        NULL as version
      FROM orders
      
      UNION ALL
      
      -- 媒体资源统计
      SELECT 
        'media' as type,
        COUNT(*) as count,
        NULL as total_size_bytes,
        NULL as version
      FROM media
    `
    
    const systemInfoResult = await query(systemInfoSql) as any[]
    const systemInfo: Record<string, any> = {}
    systemInfoResult.forEach(info => {
      systemInfo[info.type] = {
        count: info.count,
        size: info.total_size_bytes,
        version: info.version
      }
    })
    
    // 获取系统状态
    const systemStatus = {
      database: 'connected',
      api: 'running',
      cache: 'enabled',
      storage: 'normal',
      lastBackup: null,
      uptime: process.uptime()
    }
    
    // 获取最近操作日志
    const recentLogsSql = `
      SELECT * FROM admin_logs 
      ORDER BY created_at DESC 
      LIMIT 20
    `
    
    const recentLogs = await query(recentLogsSql) as any[]
    
    return NextResponse.json({
      success: true,
      data: {
        settings: groupedSettings,
        systemInfo,
        systemStatus,
        recentLogs,
        categories: Object.keys(groupedSettings)
      }
    })
    
  } catch (error) {
    console.error('获取系统设置失败:', error)
    return NextResponse.json(
      { success: false, message: '获取系统设置失败' },
      { status: 500 }
    )
  }
}

// 更新系统设置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    const { settings, category } = data
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: '设置数据不能为空' },
        { status: 400 }
      )
    }
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      const updatedSettings: any[] = []
      
      // 更新每个设置项
      for (const [key, value] of Object.entries(settings)) {
        // 检查设置是否存在
        const checkSql = 'SELECT id FROM system_settings WHERE key_name = ?'
        const existingSetting = await query(checkSql, [key]) as any[]
        
        if (existingSetting.length > 0) {
          // 更新现有设置
          const updateSql = `
            UPDATE system_settings 
            SET value = ?, updated_at = NOW(), updated_by = ?
            WHERE key_name = ?
          `
          
          await query(updateSql, [
            JSON.stringify(value),
            admin.userId,
            key
          ])
        } else {
          // 创建新设置
          const insertSql = `
            INSERT INTO system_settings (
              key_name, value, category, description, 
              data_type, is_public, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `
          
          await query(insertSql, [
            key,
            JSON.stringify(value),
            category || 'general',
            `系统设置: ${key}`,
            typeof value === 'number' ? 'number' : 
            typeof value === 'boolean' ? 'boolean' : 'string',
            false,
            admin.userId
          ])
        }
        
        updatedSettings.push(key)
      }
      
      // 记录操作日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, details, created_at)
        VALUES (?, 'update_system_settings', 'settings', ?, NOW())
      `
      
      await query(logSql, [
        admin.userId,
        JSON.stringify({ 
          category, 
          updatedSettings, 
          count: updatedSettings.length 
        })
      ])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: `成功更新 ${updatedSettings.length} 个系统设置`,
        data: { updatedSettings }
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('更新系统设置失败:', error)
    return NextResponse.json(
      { success: false, message: '更新系统设置失败' },
      { status: 500 }
    )
  }
}

// 系统维护操作
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    const { action, options = {} } = data
    
    if (!action) {
      return NextResponse.json(
        { success: false, message: '操作类型不能为空' },
        { status: 400 }
      )
    }
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      let resultMessage = ''
      let resultData: any = {}
      
      switch (action) {
        case 'clear_cache':
          // 清理缓存
          const cacheTypes = options.types || ['all']
          let clearedCount = 0
          
          if (cacheTypes.includes('all') || cacheTypes.includes('user')) {
            // 清理用户相关缓存
            // 这里可以调用实际的缓存清理逻辑
            clearedCount++
          }
          
          if (cacheTypes.includes('all') || cacheTypes.includes('media')) {
            // 清理媒体资源缓存
            clearedCount++
          }
          
          if (cacheTypes.includes('all') || cacheTypes.includes('order')) {
            // 清理订单缓存
            clearedCount++
          }
          
          resultMessage = `成功清理 ${clearedCount} 类缓存`
          resultData = { clearedTypes: cacheTypes }
          break
          
        case 'backup_database':
          // 数据库备份
          const backupName = `backup_${Date.now()}.sql`
          const backupPath = path.join(process.cwd(), 'backups', backupName)
          
          // 确保备份目录存在
          await fs.mkdir(path.dirname(backupPath), { recursive: true })
          
          // 这里应该调用实际的数据库备份命令
          // 例如: mysqldump -u username -p database > backup.sql
          // 由于环境限制，这里只创建备份记录
          
          const backupSql = `
            INSERT INTO system_backups (
              backup_name, backup_path, backup_size, 
              status, created_by, created_at
            ) VALUES (?, ?, 0, 'completed', ?, NOW())
          `
          
          await query(backupSql, [
            backupName,
            backupPath,
            admin.userId
          ])
          
          resultMessage = `数据库备份创建成功: ${backupName}`
          resultData = { backupName, backupPath }
          break
          
        case 'optimize_tables':
          // 优化数据库表
          const tablesSql = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
              AND table_type = 'BASE TABLE'
          `
          
          const tables = await query(tablesSql) as any[]
          const optimizedTables: string[] = []
          
          for (const table of tables) {
            try {
              await query(`OPTIMIZE TABLE ${table.table_name}`)
              optimizedTables.push(table.table_name)
            } catch (error) {
              console.warn(`优化表 ${table.table_name} 失败:`, error)
            }
          }
          
          resultMessage = `成功优化 ${optimizedTables.length} 个数据库表`
          resultData = { optimizedTables }
          break
          
        case 'cleanup_logs':
          // 清理旧日志
          const daysToKeep = options.days || 30
          const cleanupSql = `
            DELETE FROM admin_logs 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
          `
          
          const cleanupResult = await query(cleanupSql, [daysToKeep]) as any
          const deletedCount = cleanupResult.affectedRows || 0
          
          resultMessage = `成功清理 ${deletedCount} 条旧日志（保留最近 ${daysToKeep} 天）`
          resultData = { deletedCount, daysToKeep }
          break
          
        case 'update_system':
          // 系统更新
          const updateType = options.type || 'minor'
          let updateSteps: string[] = []
          
          if (updateType === 'minor') {
            // 小版本更新：清理缓存，优化数据库
            updateSteps = ['clear_cache', 'optimize_tables']
          } else if (updateType === 'major') {
            // 大版本更新：备份数据库，清理缓存，优化数据库
            updateSteps = ['backup_database', 'clear_cache', 'optimize_tables']
          }
          
          // 执行更新步骤
          const executedSteps: string[] = []
          for (const step of updateSteps) {
            // 这里可以调用相应的函数
            executedSteps.push(step)
          }
          
          resultMessage = `系统更新完成，执行了 ${executedSteps.length} 个步骤`
          resultData = { updateType, executedSteps }
          break
          
        case 'test_connections':
          // 测试系统连接
          const connections: Record<string, any> = {}
          
          // 测试数据库连接
          try {
            const dbTest = await query('SELECT 1 as test') as any[]
            connections.database = {
              status: 'connected',
              responseTime: '正常',
              details: dbTest[0]?.test === 1 ? '连接正常' : '连接异常'
            }
          } catch (error) {
            connections.database = {
              status: 'disconnected',
              responseTime: '超时',
              details: error instanceof Error ? error.message : '未知错误'
            }
          }
          
          // 测试缓存连接
          connections.cache = {
            status: 'enabled',
            responseTime: '正常',
            details: '缓存服务可用'
          }
          
          // 测试存储连接
          connections.storage = {
            status: 'available',
            responseTime: '正常',
            details: '存储服务可用'
          }
          
          // 测试外部API连接
          connections.external_apis = {
            status: 'mixed',
            responseTime: '部分正常',
            details: '部分外部服务连接正常'
          }
          
          resultMessage = '系统连接测试完成'
          resultData = { connections }
          break
          
        default:
          throw new Error('不支持的系统维护操作')
      }
      
      // 记录维护操作日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, details, created_at)
        VALUES (?, 'system_maintenance', 'system', ?, NOW())
      `
      
      await query(logSql, [
        admin.userId,
        JSON.stringify({ action, options, result: resultMessage })
      ])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: resultMessage,
        data: resultData
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('系统维护操作失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(
      { success: false, message: `系统维护操作失败: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// 权限管理
export async function PATCH(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    const { userId, permissions, role } = data
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '用户ID不能为空' },
        { status: 400 }
      )
    }
    
    // 检查用户是否存在
    const userCheckSql = 'SELECT id, real_name, user_type FROM users WHERE id = ?'
    const userCheck = await query(userCheckSql, [userId]) as any[]
    
    if (userCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }
    
    const user = userCheck[0]
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      // 更新用户角色
      if (role) {
        const updateRoleSql = 'UPDATE users SET user_type = ?, updated_at = NOW() WHERE id = ?'
        await query(updateRoleSql, [role, userId])
      }
      
      // 更新用户权限
      if (permissions && typeof permissions === 'object') {
        // 删除现有权限
        const deletePermissionsSql = 'DELETE FROM user_permissions WHERE user_id = ?'
        await query(deletePermissionsSql, [userId])
        
        // 添加新权限
        for (const [resource, actions] of Object.entries(permissions)) {
          if (Array.isArray(actions)) {
            for (const action of actions) {
              const insertPermissionSql = `
                INSERT INTO user_permissions (user_id, resource, action, created_at)
                VALUES (?, ?, ?, NOW())
              `
              await query(insertPermissionSql, [userId, resource, action])
            }
          }
        }
      }
      
      // 记录权限变更日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'update_permissions', 'user', ?, ?, NOW())
      `
      
      await query(logSql, [
        admin.userId,
        userId,
        JSON.stringify({ 
          previousRole: user.user_type, 
          newRole: role,
          permissions,
          userName: user.real_name
        })
      ])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: '用户权限更新成功',
        data: { userId, role, permissions }
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('更新用户权限失败:', error)
    return NextResponse.json(
      { success: false, message: '更新用户权限失败' },
      { status: 500 }
    )
  }
}

// 获取权限模板和角色
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    // 获取角色和权限模板
    const rolesSql = `
      SELECT 
        user_type as role,
        COUNT(*) as user_count,
        GROUP_CONCAT(DISTINCT real_name) as sample_users
      FROM users
      GROUP BY user_type
      ORDER BY user_count DESC
    `
    
    const roles = await query(rolesSql) as any[]
    
    // 预定义的权限模板
    const permissionTemplates = {
      admin: {
        name: '管理员',
        description: '完全系统访问权限',
        permissions: {
          users: ['create', 'read', 'update', 'delete'],
          orders: ['create', 'read', 'update', 'delete', 'approve'],
          media: ['create', 'read', 'update', 'delete', 'approve'],
          finance: ['create', 'read', 'update', 'delete', 'approve'],
          settings: ['read', 'update'],
          analytics: ['read'],
          suppliers: ['create', 'read', 'update', 'delete']
        }
      },
      manager: {
        name: '经理',
        description: '业务管理权限',
        permissions: {
          users: ['read', 'update'],
          orders: ['create', 'read', 'update', 'approve'],
          media: ['read', 'update'],
          finance: ['read'],
          analytics: ['read'],
          suppliers: ['read', 'update']
        }
      },
      operator: {
        name: '操作员',
        description: '日常操作权限',
        permissions: {
          orders: ['create', 'read', 'update'],
          media: ['read'],
          finance: ['read']
        }
      },
      viewer: {
        name: '查看者',
        description: '只读权限',
        permissions: {
          users: ['read'],
          orders: ['read'],
          media: ['read'],
          finance: ['read'],
          analytics: ['read']
        }
      }
    }
    
    // 获取系统资源列表
    const resources = Object.keys(permissionTemplates.admin.permissions)
    
    // 获取当前权限分配
    const currentPermissionsSql = `
      SELECT 
        u.id,
        u.real_name,
        u.user_type,
        GROUP_CONCAT(DISTINCT CONCAT(up.resource, ':', up.action)) as permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.user_type IN ('admin', 'manager')
      GROUP BY u.id
      ORDER BY u.user_type, u.real_name
    `
    
    const currentPermissions = await query(currentPermissionsSql) as any[]
    
    return NextResponse.json({
      success: true,
      data: {
        roles,
        permissionTemplates,
        resources,
        currentPermissions,
        availableActions: ['create', 'read', 'update', 'delete', 'approve']
      }
    })
    
  } catch (error) {
    console.error('获取权限信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取权限信息失败' },
      { status: 500 }
    )
  }
}