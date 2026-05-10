import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

type ReportType = 'dashboard' | 'user_behavior' | 'media_performance' | 'revenue_trends' | 'recommendation_effectiveness' | 'custom';
type DateRange = '1d' | '7d' | '30d' | '90d' | '1y';
type ScheduleFreq = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface ReportSchedule {
  id: number;
  report_id: number | null;
  title: string;
  report_type: ReportType;
  date_range: DateRange;
  schedule_freq: ScheduleFreq;
  schedule_day: number | null;
  schedule_time: string;
  recipients: any;
  auto_export: number;
  export_format: string;
  is_active: number;
  created_by: number;
  last_generated_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId && userId !== 0) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '20')));
    const offset = (page - 1) * pageSize;

    const isActive = searchParams.get('is_active');
    const reportType = searchParams.get('report_type');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const allowedSortFields = ['created_at', 'updated_at', 'title', 'schedule_freq', 'next_run_at', 'is_active'];
    const safeSortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const whereClauses: string[] = ['s.created_by = ?'];
    const params: any[] = [userId];

    if (isActive !== null && isActive !== undefined) {
      whereClauses.push('s.is_active = ?');
      params.push(isActive === '1' || isActive === 'true' ? 1 : 0);
    }

    if (reportType) {
      whereClauses.push('s.report_type = ?');
      params.push(reportType);
    }

    const whereSQL = 'WHERE ' + whereClauses.join(' AND ');

    const countResult = await query(
      'SELECT COUNT(*) as total FROM report_schedules s ' + whereSQL,
      params
    ) as any[];
    const total = countResult[0]?.total || 0;

    const schedules = await query(
      'SELECT s.* FROM report_schedules s ' + whereSQL + ' ORDER BY s.' + safeSortField + ' ' + safeSortOrder + ' LIMIT ? OFFSET ?',
      [...params, pageSize, offset]
    ) as ReportSchedule[];

    const parsedSchedules = schedules.map(s => ({
      ...s,
      recipients: typeof s.recipients === 'string' ? JSON.parse(s.recipients) : s.recipients
    }));

    return NextResponse.json({
      success: true,
      data: parsedSchedules,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    });

  } catch (error: any) {
    console.error('获取调度列表失败:', error);
    return NextResponse.json(
      { error: '获取调度列表失败', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId && userId !== 0) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const { title, report_type, date_range, schedule_freq, schedule_day, schedule_time, recipients, auto_export, export_format } = body;

    if (!title || !report_type || !schedule_freq || !schedule_time) {
      return NextResponse.json(
        { error: '缺少必填字段：title, report_type, schedule_freq, schedule_time' },
        { status: 400 }
      );
    }

    const validFreqs: ScheduleFreq[] = ['daily', 'weekly', 'monthly', 'quarterly'];
    if (!validFreqs.includes(schedule_freq)) {
      return NextResponse.json({ error: '无效的调度频率', valid: validFreqs }, { status: 400 });
    }

    const validReportTypes: ReportType[] = ['dashboard', 'user_behavior', 'media_performance', 'revenue_trends', 'recommendation_effectiveness', 'custom'];
    if (!validReportTypes.includes(report_type)) {
      return NextResponse.json({ error: '无效的报表类型', valid: validReportTypes }, { status: 400 });
    }

    const validDateRanges: DateRange[] = ['1d', '7d', '30d', '90d', '1y'];
    const effectiveDateRange: DateRange = validDateRanges.includes(date_range) ? date_range : '7d';

    if (schedule_freq === 'weekly' && (schedule_day === undefined || schedule_day < 0 || schedule_day > 6)) {
      return NextResponse.json({ error: 'weekly频率需要schedule_day（0-6，周日至周六）' }, { status: 400 });
    }
    if (schedule_freq === 'monthly' && (schedule_day === undefined || schedule_day < 1 || schedule_day > 31)) {
      return NextResponse.json({ error: 'monthly频率需要schedule_day（1-31）' }, { status: 400 });
    }

    const nextRunAt = calculateNextRun(schedule_freq, schedule_day || 0, schedule_time);

    const insertResult = await query(
      'INSERT INTO report_schedules (title, report_type, date_range, schedule_freq, schedule_day, schedule_time, recipients, auto_export, export_format, created_by, next_run_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title, report_type, effectiveDateRange, schedule_freq,
        schedule_day ?? null, schedule_time,
        recipients ? JSON.stringify(recipients) : null,
        auto_export ? 1 : 0, export_format || 'csv', userId, nextRunAt
      ]
    ) as any;

    const scheduleId = insertResult.insertId;
    const schedules = await query('SELECT * FROM report_schedules WHERE id = ?', [scheduleId]) as ReportSchedule[];
    const schedule = schedules[0];

    return NextResponse.json({
      success: true,
      message: '调度创建成功',
      data: {
        ...schedule,
        recipients: typeof schedule.recipients === 'string' ? JSON.parse(schedule.recipients) : schedule.recipients
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('创建调度失败:', error);
    return NextResponse.json(
      { error: '创建调度失败', details: error.message },
      { status: 500 }
    );
  }
}

function calculateNextRun(freq: ScheduleFreq, day: number, time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  switch (freq) {
    case 'daily': {
      const next = new Date(now);
      next.setHours(hours || 8, minutes || 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next.toISOString().slice(0, 19).replace('T', ' ');
    }
    case 'weekly': {
      const targetDay = day;
      const currentDay = now.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      const next = new Date(now);
      next.setDate(next.getDate() + daysUntil);
      next.setHours(hours || 8, minutes || 0, 0, 0);
      return next.toISOString().slice(0, 19).replace('T', ' ');
    }
    case 'monthly': {
      const targetDate = Math.min(day, 28);
      let next = new Date(now.getFullYear(), now.getMonth(), targetDate, hours || 8, minutes || 0, 0);
      if (next <= now) {
        next = new Date(now.getFullYear(), now.getMonth() + 1, targetDate, hours || 8, minutes || 0, 0);
      }
      return next.toISOString().slice(0, 19).replace('T', ' ');
    }
    case 'quarterly': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const targetMonth = currentQuarter * 3;
      let next = new Date(now.getFullYear(), targetMonth, Math.min(day || 1, 28), hours || 8, minutes || 0, 0);
      if (next <= now) {
        next = new Date(now.getFullYear(), targetMonth + 3, Math.min(day || 1, 28), hours || 8, minutes || 0, 0);
      }
      return next.toISOString().slice(0, 19).replace('T', ' ');
    }
    default:
      return '';
  }
}
