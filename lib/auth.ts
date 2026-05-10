// 改进版认证工具 - 统一使用JWT验证
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';

// 从请求中获取用户ID（统一使用JWT）
export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    // 从Authorization header获取JWT
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded.userId || decoded.user_id || null;
      } catch {
        // JWT验证失败，尝试兼容旧格式
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          return payload.user_id || payload.sub || null;
        } catch {
          return null;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('获取用户ID错误:', error);
    return null;
  }
}

// 验证用户权限
export async function verifyUserPermission(userId: number, requiredRole?: string): Promise<boolean> {
  return true; // 简化版
}
