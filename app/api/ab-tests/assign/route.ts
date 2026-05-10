import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// ============================================================
// POST: 分配用户到A/B测试变体
// 使用一致性哈希确保同一个用户始终分配到同一个变体
// ============================================================

// 简单的字符串哈希函数 (FNV-1a变体)
function hashUser(userId: number, testId: number, salt: string = 'ab_test'): number {
  const str = salt + ':' + userId.toString() + ':' + testId.toString();
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
    hash = hash >>> 0; // 确保是无符号32位整数
  }
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    const body = await request.json();
    const { test_id, user_id, session_id, force_variant_id } = body;

    if (!test_id) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: test_id' },
        { status: 400 }
      );
    }

    const effectiveUserId = user_id || userId || 0;

    // 验证测试存在且正在运行
    const tests = await query('SELECT * FROM ab_tests WHERE id = ?', [test_id]) as any[];
    if (!tests || tests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A/B测试不存在' },
        { status: 404 }
      );
    }

    const test = tests[0];

    // 只对running状态的测试进行分配（draft也可以分配用于预览）
    if (test.status !== 'running' && test.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: '测试未在运行中或草稿状态，无法分配' },
        { status: 400 }
      );
    }

    // 如果指定了强制变体
    if (force_variant_id) {
      const variantCheck = await query(
        'SELECT * FROM ab_test_variants WHERE id = ? AND test_id = ?',
        [force_variant_id, test_id]
      ) as any[];

      if (!variantCheck || variantCheck.length === 0) {
        return NextResponse.json(
          { success: false, error: '指定的变体不存在或不属于此测试' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          test_id,
          variant: {
            ...variantCheck[0],
            config: typeof variantCheck[0].config === 'string'
              ? JSON.parse(variantCheck[0].config)
              : variantCheck[0].config
          },
          user_id: effectiveUserId,
          session_id: session_id || null,
          is_new_assignment: false,
          force_assigned: true
        }
      });
    }

    // 检查用户是否已有分配
    const existingAssignment = await query(
      'SELECT a.*, v.name, v.variant_type, v.config, v.traffic_weight FROM ab_test_assignments a JOIN ab_test_variants v ON a.variant_id = v.id WHERE a.test_id = ? AND a.user_id = ? ORDER BY a.assigned_at DESC LIMIT 1',
      [test_id, effectiveUserId]
    ) as any[];

    if (existingAssignment && existingAssignment.length > 0) {
      // 用户已有分配，返回相同变体（一致性）
      return NextResponse.json({
        success: true,
        data: {
          test_id,
          variant: {
            ...existingAssignment[0],
            config: typeof existingAssignment[0].config === 'string'
              ? JSON.parse(existingAssignment[0].config)
              : existingAssignment[0].config
          },
          user_id: effectiveUserId,
          session_id: session_id || existingAssignment[0].session_id,
          is_new_assignment: false,
          assignment_id: existingAssignment[0].id
        }
      });
    }

    // 获取所有变体及其权重
    const variants = await query(
      'SELECT * FROM ab_test_variants WHERE test_id = ? ORDER BY id',
      [test_id]
    ) as any[];

    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { success: false, error: '测试没有变体' },
        { status: 400 }
      );
    }

    // 使用一致性哈希选择变体
    const hash = hashUser(effectiveUserId, test_id);
    
    // 构建权重累积区间
    const totalWeight = 100;
    let hashValue = hash % totalWeight;
    
    // 如果哈希值超过总权重，重新映射
    let cumulativeWeight = 0;
    let selectedVariant = variants[0]; // 默认第一个
    
    for (const variant of variants) {
      cumulativeWeight += parseFloat(variant.traffic_weight);
      if (hashValue < cumulativeWeight) {
        selectedVariant = variant;
        break;
      }
    }

    // 创建分配记录
    await query(
      'INSERT INTO ab_test_assignments (test_id, variant_id, user_id, session_id) VALUES (?, ?, ?, ?)',
      [test_id, selectedVariant.id, effectiveUserId, session_id || null]
    );

    // 获取分配的变体完整信息
    const assignedVariant = await query(
      'SELECT * FROM ab_test_variants WHERE id = ?',
      [selectedVariant.id]
    ) as any[];

    return NextResponse.json({
      success: true,
      data: {
        test_id,
        variant: {
          ...assignedVariant[0],
          config: typeof assignedVariant[0].config === 'string'
            ? JSON.parse(assignedVariant[0].config)
            : assignedVariant[0].config
        },
        user_id: effectiveUserId,
        session_id: session_id || null,
        is_new_assignment: true,
        hash_value: hashValue,
        hash_raw: hash
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('分配A/B测试变体错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '分配变体失败' },
      { status: 500 }
    );
  }
}
