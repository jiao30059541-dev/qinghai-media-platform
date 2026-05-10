import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// ============================================================
// POST: 跟踪A/B测试事件
// ============================================================

interface TrackEventInput {
  variant_id: number;
  event_type: 'impression' | 'click' | 'view' | 'add_to_cart' | 'purchase' | 'conversion' | 'custom';
  event_name?: string;
  event_value?: number;
  session_id?: string;
  metadata?: Record<string, any>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    const testId = parseInt(params.id);

    if (isNaN(testId)) {
      return NextResponse.json(
        { success: false, error: '无效的测试ID' },
        { status: 400 }
      );
    }

    // 验证测试存在且正在运行
    const tests = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];
    if (!tests || tests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A/B测试不存在' },
        { status: 404 }
      );
    }

    const test = tests[0];

    // 只有running状态的测试可以跟踪事件 (但为了方便调试，也允许completed状态)
    if (test.status !== 'running' && test.status !== 'completed' && test.status !== 'paused') {
      return NextResponse.json(
        { success: false, error: '测试未在运行中，无法跟踪事件' },
        { status: 400 }
      );
    }

    const body: TrackEventInput = await request.json();

    // 验证必填字段
    if (!body.variant_id || !body.event_type) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: variant_id, event_type' },
        { status: 400 }
      );
    }

    // 验证变体属于此测试
    const variantCheck = await query(
      'SELECT id FROM ab_test_variants WHERE id = ? AND test_id = ?',
      [body.variant_id, testId]
    ) as any[];
    if (!variantCheck || variantCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: '变体ID不属于此测试' },
        { status: 400 }
      );
    }

    // 记录事件
    const insertSql = 'INSERT INTO ab_test_events (test_id, variant_id, user_id, session_id, event_type, event_name, event_value, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await query(insertSql, [
      testId,
      body.variant_id,
      userId || 0,
      body.session_id || null,
      body.event_type,
      body.event_name || null,
      body.event_value || null,
      body.metadata ? JSON.stringify(body.metadata) : null
    ]);

    return NextResponse.json({
      success: true,
      message: '事件已记录',
      data: {
        test_id: testId,
        variant_id: body.variant_id,
        event_type: body.event_type,
        user_id: userId || 0,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('跟踪A/B测试事件错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '跟踪事件失败' },
      { status: 500 }
    );
  }
}
