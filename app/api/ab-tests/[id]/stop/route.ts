import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// ============================================================
// 统计工具函数 (与list/id route共享)
// ============================================================
function computeChiSquare(observed: number[][]): { chiSquare: number; degreesOfFreedom: number } {
  const rows = observed.length;
  const cols = observed[0].length;
  const degreesOfFreedom = (rows - 1) * (cols - 1);
  const rowSums = observed.map(r => r.reduce((a, b) => a + b, 0));
  const colSums: number[] = []; for (let j = 0; j < cols; j++) { colSums.push(observed.reduce((sum, r) => sum + r[j], 0)); }
  const total = rowSums.reduce((a, b) => a + b, 0);
  if (total === 0) return { chiSquare: 0, degreesOfFreedom };
  let chiSquare = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const expected = (rowSums[i] * colSums[j]) / total;
      if (expected > 0) {
        chiSquare += Math.pow(observed[i][j] - expected, 2) / expected;
      }
    }
  }
  return { chiSquare, degreesOfFreedom };
}

function pValueFromChiSquare(chiSquare: number, df: number): number {
  if (chiSquare <= 0 || df <= 0) return 1.0;
  if (df > 100) {
    const z = Math.sqrt(2 * chiSquare) - Math.sqrt(2 * df - 1);
    return 0.5 * (1 - erf(z / Math.sqrt(2)));
  }
  return 1 - regularizedGammaP(df / 2, chiSquare / 2);
}

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

function logGamma(x: number): number {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  const tmp = x + 5.5;
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + (x + 0.5) * Math.log(tmp) + Math.log(2.5066282746310005 * ser / x);
}

function regularizedGammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return 1;
  if (x === 0) return 0;
  if (x < a + 1) {
    let sum = 1 / a;
    let term = sum;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-15 * Math.abs(sum)) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    const FPB = 1e-15;
    const MAX_ITER = 200;
    let b = x + 1 - a;
    let c = 1 / FPB;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= MAX_ITER; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < FPB) d = FPB;
      c = b + an / c;
      if (Math.abs(c) < FPB) c = FPB;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < 1e-15) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
  }
}

async function calculateTestStats(testId: number): Promise<{
  variants: Array<{
    id: number; name: string; variant_type: string;
    impressions: number; conversions: number; conversion_rate: number;
    click_count: number; click_rate: number; revenue: number;
  }>;
  chi_square: number; p_value: number; is_significant: boolean;
  confidence_level: number; winner_variant_id: number | null; degrees_of_freedom: number;
}> {
  const tests = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];
  if (!tests || tests.length === 0) throw new Error('A/B测试不存在');
  const test = tests[0];
  const confidenceLevel = parseFloat(test.confidence_level) / 100;

  const variants = await query('SELECT * FROM ab_test_variants WHERE test_id = ? ORDER BY id', [testId]) as any[];
  const variantStats: any[] = [];

  for (const variant of variants) {
    const impressionsResult = await query(
      'SELECT COUNT(*) as cnt FROM ab_test_events WHERE test_id = ? AND variant_id = ? AND event_type = ?',
      [testId, variant.id, 'impression']
    ) as any[];
    const impressions = impressionsResult[0]?.cnt || 0;

    const conversionsResult = await query(
      'SELECT COUNT(*) as cnt FROM ab_test_events WHERE test_id = ? AND variant_id = ? AND event_type = ?',
      [testId, variant.id, 'conversion']
    ) as any[];
    const conversions = conversionsResult[0]?.cnt || 0;

    const clicksResult = await query(
      'SELECT COUNT(*) as cnt FROM ab_test_events WHERE test_id = ? AND variant_id = ? AND event_type = ?',
      [testId, variant.id, 'click']
    ) as any[];
    const clickCount = clicksResult[0]?.cnt || 0;

    const revenueResult = await query(
      'SELECT COALESCE(SUM(event_value), 0) as total FROM ab_test_events WHERE test_id = ? AND variant_id = ? AND event_type = ?',
      [testId, variant.id, 'conversion']
    ) as any[];
    const revenue = parseFloat(revenueResult[0]?.total || '0');

    variantStats.push({
      id: variant.id, name: variant.name, variant_type: variant.variant_type,
      impressions, conversions,
      conversion_rate: impressions > 0 ? Math.round((conversions / impressions) * 100000) / 100000 : 0,
      click_count: clickCount,
      click_rate: impressions > 0 ? Math.round((clickCount / impressions) * 100000) / 100000 : 0,
      revenue
    });
  }

  let winnerVariantId: number | null = null;
  let chiSquare = 0, pValue = 1, isSignificant = false, degreesOfFreedom = 0;

  const filteredStats = variantStats.filter(v => v.impressions > 0);
  if (filteredStats.length >= 2) {
    const observed: number[][] = filteredStats.map(v => [v.conversions, v.impressions - v.conversions]);
    const result = computeChiSquare(observed);
    chiSquare = Math.round(result.chiSquare * 10000) / 10000;
    degreesOfFreedom = result.degreesOfFreedom;
    pValue = Math.round(pValueFromChiSquare(result.chiSquare, result.degreesOfFreedom) * 10000) / 10000;
    isSignificant = (1 - pValue) >= confidenceLevel;

    if (isSignificant) {
      let bestVariant = filteredStats.reduce((best, curr) =>
        curr.conversion_rate > best.conversion_rate ? curr : best
      );
      const controlVariant = filteredStats.find(v => v.variant_type === 'control');
      if (controlVariant && bestVariant.conversion_rate > controlVariant.conversion_rate) {
        winnerVariantId = bestVariant.id;
      } else if (!controlVariant) {
        winnerVariantId = bestVariant.id;
      }
    }
  }

  return {
    variants: variantStats, chi_square: chiSquare, p_value: pValue,
    is_significant: isSignificant, confidence_level: parseFloat(test.confidence_level),
    winner_variant_id: winnerVariantId, degrees_of_freedom: degreesOfFreedom
  };
}

// ============================================================
// POST: 停止A/B测试
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

    // 只有running状态的测试可以停止
    if (test.status !== 'running' && test.status !== 'paused') {
      return NextResponse.json(
        { success: false, error: '只能停止运行中或暂停的测试，当前状态: ' + test.status },
        { status: 400 }
      );
    }

    // 计算统计结果
    const stats = await calculateTestStats(testId);

    // 更新测试状态为completed，并设置winner
    await query(
      'UPDATE ab_tests SET status = ?, end_at = ?, winner_variant_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        'completed',
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        stats.winner_variant_id,
        testId
      ]
    );

    // 如果找到了winner，更新winner变体的标记
    if (stats.winner_variant_id) {
      // 可以在这里记录获胜信息
    }

    const updatedTest = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];
    const variants = await query(
      'SELECT * FROM ab_test_variants WHERE test_id = ? ORDER BY id',
      [testId]
    ) as any[];

    return NextResponse.json({
      success: true,
      message: stats.is_significant
        ? 'A/B测试已停止，' + (stats.winner_variant_id ? '已确定获胜变体' : '但未找到显著优胜者')
        : 'A/B测试已停止，统计结果未达到显著性水平',
      data: {
        ...updatedTest[0],
        target_audience: typeof updatedTest[0].target_audience === 'string'
          ? JSON.parse(updatedTest[0].target_audience)
          : updatedTest[0].target_audience,
        variants: variants.map((v: any) => ({
          ...v,
          config: typeof v.config === 'string' ? JSON.parse(v.config) : v.config
        })),
        statistics: stats
      }
    });
  } catch (error: any) {
    console.error('停止A/B测试错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '停止A/B测试失败' },
      { status: 500 }
    );
  }
}
