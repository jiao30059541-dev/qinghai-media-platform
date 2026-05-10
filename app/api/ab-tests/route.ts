import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// ============================================================
// A/B测试列表 - GET & 创建新测试 - POST
// ============================================================

interface AbTestCreateInput {
  name: string;
  description?: string;
  test_type: 'recommendation_algorithm' | 'landing_page' | 'ui_component' | 'pricing' | 'feature' | 'other';
  hypothesis?: string;
  target_audience?: Record<string, any>;
  min_sample_size?: number;
  confidence_level?: number;
  variants: Array<{
    name: string;
    variant_type: 'control' | 'treatment';
    config: Record<string, any>;
    traffic_weight: number;
  }>;
}

// 卡方检验 - 计算卡方统计量
function computeChiSquare(observed: number[][]): { chiSquare: number; degreesOfFreedom: number } {
  const rows = observed.length;
  const cols = observed[0].length;
  const degreesOfFreedom = (rows - 1) * (cols - 1);

  // 计算行总和、列总和和总计数
  const rowSums = observed.map(r => r.reduce((a, b) => a + b, 0));
  const colSums: number[] = []; for (let j = 0; j < cols; j++) { colSums.push(observed.reduce((sum, r) => sum + r[j], 0)); }
  const total = rowSums.reduce((a, b) => a + b, 0);

  if (total === 0) return { chiSquare: 0, degreesOfFreedom };

  // 计算卡方统计量
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

// 从卡方值和自由度计算p值
function pValueFromChiSquare(chiSquare: number, df: number): number {
  if (chiSquare <= 0 || df <= 0) return 1.0;

  // 对自由度 > 100 使用正态近似
  if (df > 100) {
    const z = Math.sqrt(2 * chiSquare) - Math.sqrt(2 * df - 1);
    return 0.5 * (1 - erf(z / Math.sqrt(2)));
  }

  // 使用不完全伽马函数
  return 1 - regularizedGammaP(df / 2, chiSquare / 2);
}

// 误差函数
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

// 对数伽马函数 (Lanczos近似)
function logGamma(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677,
    24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5
  ];
  let y = x;
  const tmp = x + 5.5;
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + (x + 0.5) * Math.log(tmp) + Math.log(2.5066282746310005 * ser / x);
}

// 正则化不完全伽马函数 P(a, x)
function regularizedGammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return 1;
  if (x === 0) return 0;

  if (x < a + 1) {
    // 级数展开
    let sum = 1 / a;
    let term = sum;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-15 * Math.abs(sum)) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    // 连分式展开
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

// 计算A/B测试统计分析结果
async function calculateTestStats(testId: number): Promise<{
  variants: Array<{
    id: number;
    name: string;
    variant_type: string;
    impressions: number;
    conversions: number;
    conversion_rate: number;
    click_count: number;
    click_rate: number;
    revenue: number;
  }>;
  chi_square: number;
  p_value: number;
  is_significant: boolean;
  confidence_level: number;
  winner_variant_id: number | null;
  degrees_of_freedom: number;
}> {
  const tests = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];
  if (!tests || tests.length === 0) throw new Error('A/B测试不存在');
  const test = tests[0];
  const confidenceLevel = parseFloat(test.confidence_level) / 100;

  const variants = await query(
    'SELECT * FROM ab_test_variants WHERE test_id = ? ORDER BY id',
    [testId]
  ) as any[];

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
      "SELECT COALESCE(SUM(event_value), 0) as total FROM ab_test_events WHERE test_id = ? AND variant_id = ? AND event_type = ?",
      [testId, variant.id, 'conversion']
    ) as any[];
    const revenue = parseFloat(revenueResult[0]?.total || '0');

    variantStats.push({
      id: variant.id,
      name: variant.name,
      variant_type: variant.variant_type,
      impressions,
      conversions,
      conversion_rate: impressions > 0 ? Math.round((conversions / impressions) * 100000) / 100000 : 0,
      click_count: clickCount,
      click_rate: impressions > 0 ? Math.round((clickCount / impressions) * 100000) / 100000 : 0,
      revenue
    });
  }

  // 卡方检验
  let winnerVariantId: number | null = null;
  let chiSquare = 0;
  let pValue = 1;
  let isSignificant = false;
  let degreesOfFreedom = 0;

  if (variants.length >= 2) {
    const filteredStats = variantStats.filter(v => v.impressions > 0);
    if (filteredStats.length >= 2) {
      // 观察矩阵: [转化数, 未转化数]
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
  }

  return {
    variants: variantStats,
    chi_square: chiSquare,
    p_value: pValue,
    is_significant: isSignificant,
    confidence_level: parseFloat(test.confidence_level),
    winner_variant_id: winnerVariantId,
    degrees_of_freedom: degreesOfFreedom
  };
}

// ============================================================
// GET: 获取A/B测试列表
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '20')));
    const testType = searchParams.get('test_type');
    const search = searchParams.get('search');

    const conditions: string[] = [];
    const params: any[] = [];

    if (userId && userId > 0) {
      conditions.push('t.created_by = ?');
      params.push(userId);
    }

    if (status && ['draft', 'running', 'paused', 'completed', 'cancelled'].includes(status)) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (testType) {
      conditions.push('t.test_type = ?');
      params.push(testType);
    }

    if (search) {
      conditions.push('(t.name LIKE ? OR t.description LIKE ?)');
      params.push('%' + search + '%', '%' + search + '%');
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countSql = 'SELECT COUNT(*) as total FROM ab_tests t ' + whereClause;
    const countResult = await query(countSql, params) as any[];
    const total = countResult[0]?.total || 0;

    const offset = (page - 1) * pageSize;
    const dataSql = 'SELECT t.*, ' +
      '(SELECT COUNT(*) FROM ab_test_variants WHERE test_id = t.id) as variant_count, ' +
      '(SELECT COUNT(*) FROM ab_test_assignments WHERE test_id = t.id) as assignment_count, ' +
      '(SELECT COUNT(*) FROM ab_test_events WHERE test_id = t.id) as event_count ' +
      'FROM ab_tests t ' + whereClause + ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    const tests = await query(dataSql, [...params, pageSize, offset]) as any[];

    const testIds = tests.map((t: any) => t.id);
    let variantsMap: Record<number, any[]> = {};
    if (testIds.length > 0) {
      const placeholders = testIds.map(() => '?').join(',');
      const variants = await query(
        'SELECT id, test_id, name, variant_type, traffic_weight FROM ab_test_variants WHERE test_id IN (' + placeholders + ') ORDER BY id',
        testIds
      ) as any[];
      for (const v of variants) {
        if (!variantsMap[v.test_id]) variantsMap[v.test_id] = [];
        variantsMap[v.test_id].push(v);
      }
    }

    const result = tests.map((test: any) => ({
      ...test,
      target_audience: typeof test.target_audience === 'string'
        ? JSON.parse(test.target_audience)
        : test.target_audience,
      variants: variantsMap[test.id] || []
    }));

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error: any) {
    console.error('获取A/B测试列表错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取A/B测试列表失败' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: 创建新A/B测试
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    const body: AbTestCreateInput = await request.json();

    if (!body.name || !body.test_type || !body.variants || body.variants.length < 2) {
      return NextResponse.json(
        { success: false, error: '请提供测试名称、类型和至少两个变体' },
        { status: 400 }
      );
    }

    const hasControl = body.variants.some(v => v.variant_type === 'control');
    if (!hasControl) {
      return NextResponse.json(
        { success: false, error: '变体中必须包含一个对照组 (variant_type: control)' },
        { status: 400 }
      );
    }

    const totalWeight = body.variants.reduce((sum, v) => sum + v.traffic_weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        { success: false, error: '变体流量权重总和必须为100，当前为' + totalWeight },
        { status: 400 }
      );
    }

    for (const v of body.variants) {
      if (v.traffic_weight <= 0 || v.traffic_weight > 100) {
        return NextResponse.json(
          { success: false, error: '变体"' + v.name + '"的权重必须在0到100之间' },
          { status: 400 }
        );
      }
    }

    await query('START TRANSACTION');

    try {
      const insertTestSql = 'INSERT INTO ab_tests (name, description, test_type, hypothesis, target_audience, min_sample_size, confidence_level, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ' + "'draft'" + ', ?)';
      const targetAudienceJson = body.target_audience ? JSON.stringify(body.target_audience) : null;
      const testResult = await query(insertTestSql, [
        body.name,
        body.description || null,
        body.test_type,
        body.hypothesis || null,
        targetAudienceJson,
        body.min_sample_size || 1000,
        body.confidence_level || 95.00,
        userId || 0
      ]) as any;
      const testId = testResult.insertId;

      const insertVariantSql = 'INSERT INTO ab_test_variants (test_id, name, variant_type, config, traffic_weight) VALUES (?, ?, ?, ?, ?)';
      for (const variant of body.variants) {
        await query(insertVariantSql, [
          testId,
          variant.name,
          variant.variant_type,
          JSON.stringify(variant.config || {}),
          variant.traffic_weight
        ]);
      }

      await query('COMMIT');

      const newTest = await query('SELECT * FROM ab_tests WHERE id = ?', [testId]) as any[];
      const variants = await query(
        'SELECT * FROM ab_test_variants WHERE test_id = ? ORDER BY id',
        [testId]
      ) as any[];

      return NextResponse.json({
        success: true,
        message: 'A/B测试创建成功',
        data: {
          ...newTest[0],
          target_audience: newTest[0].target_audience
            ? (typeof newTest[0].target_audience === 'string'
              ? JSON.parse(newTest[0].target_audience)
              : newTest[0].target_audience)
            : null,
          variants: variants.map((v: any) => ({
            ...v,
            config: typeof v.config === 'string' ? JSON.parse(v.config) : v.config
          }))
        }
      }, { status: 201 });
    } catch (innerError: any) {
      await query('ROLLBACK');
      throw innerError;
    }
  } catch (error: any) {
    console.error('创建A/B测试错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建A/B测试失败' },
      { status: 500 }
    );
  }
}
