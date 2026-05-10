import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// ============================================================
// POST: 启动A/B测试
// ============================================================
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

    const tests = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];
    if (!tests || tests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A/B测试不存在' },
        { status: 404 }
      );
    }

    const test = tests[0];

    // 权限检查
    if (userId && userId > 0 && test.created_by !== userId) {
      return NextResponse.json(
        { success: false, error: '无权操作此测试' },
        { status: 403 }
      );
    }

    // 只有draft或paused状态的测试可以启动
    if (test.status !== 'draft' && test.status !== 'paused') {
      return NextResponse.json(
        { success: false, error: '只有草稿或暂停状态的测试可以启动，当前状态: ' + test.status },
        { status: 400 }
      );
    }

    // 检查是否有变体
    const variants = await query(
      'SELECT COUNT(*) as cnt FROM ab_test_variants WHERE test_id = ?',
      [testId]
    ) as any[];
    if (variants[0]?.cnt < 2) {
      return NextResponse.json(
        { success: false, error: '测试至少需要2个变体才能启动' },
        { status: 400 }
      );
    }

    // 计算结束时间 (默认30天后)
    // 支持通过请求体自定义持续时间
    let durationDays = 30;
    try {
      const body = await request.json();
      if (body.duration_days && typeof body.duration_days === 'number' && body.duration_days > 0) {
        durationDays = body.duration_days;
      }
    } catch (e) {
      // 没有请求体，使用默认值
    }

    const now = new Date();
    const endAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await query(
      'UPDATE ab_tests SET status = ?, start_at = ?, end_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['running', now.toISOString().slice(0, 19).replace('T', ' '), endAt.toISOString().slice(0, 19).replace('T', ' '), testId]
    );

    const updatedTest = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];

    return NextResponse.json({
      success: true,
      message: 'A/B测试已启动',
      data: {
        ...updatedTest[0],
        estimated_end_at: endAt.toISOString(),
        duration_days: durationDays
      }
    });
  } catch (error: any) {
    console.error('启动A/B测试错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '启动A/B测试失败' },
      { status: 500 }
    );
  }
}
