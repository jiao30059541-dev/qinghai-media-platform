import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

type ScheduleFreq = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface ReportSchedule {
  id: number;
  report_id: number | null;
  title: string;
  report_type: string;
  date_range: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId && userId !== 0) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的调度ID' }, { status: 400 });
    }

    const schedules = await query(
      'SELECT * FROM report_schedules WHERE id = ? AND created_by = ?',
      [id, userId]
    ) as ReportSchedule[];

    if (schedules.length === 0) {
      return NextResponse.json({ error: '调度不存在或无权访问' }, { status: 404 });
    }

    const schedule = schedules[0];

    return NextResponse.json({
      success: true,
      data: {
        ...schedule,
        recipients: typeof schedule.recipients === 'string' ? JSON.parse(schedule.recipients) : schedule.recipients
      }
    });

  } catch (error: any) {
    console.error('获取调度详情失败:', error);
    return NextResponse.json(
      { error: '获取调度详情失败', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId && userId !== 0) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的调度ID' }, { status: 400 });
    }

    const schedules = await query(
      'SELECT * FROM report_schedules WHERE id = ? AND created_by = ?',
      [id, userId]
    ) as ReportSchedule[];

    if (schedules.length === 0) {
      return NextResponse.json({ error: '调度不存在或无权访问' }, { status: 404 });
    }

    const body = await request.json();
    const { title, report_type, date_range, schedule_freq, schedule_day, schedule_time, recipients, auto_export, export_format, is_active } = body;

    const updateFields: string[] = [];
    const updateParams: any[] = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateParams.push(title); }
    if (report_type !== undefined) { updateFields.push('report_type = ?'); updateParams.push(report_type); }
    if (date_range !== undefined) { updateFields.push('date_range = ?'); updateParams.push(date_range); }
    if (schedule_freq !== undefined) { updateFields.push('schedule_freq = ?'); updateParams.push(schedule_freq); }
    if (schedule_day !== undefined) { updateFields.push('schedule_day = ?'); updateParams.push(schedule_day); }
    if (schedule_time !== undefined) { updateFields.push('schedule_time = ?'); updateParams.push(schedule_time); }
    if (recipients !== undefined) { updateFields.push('recipients = ?'); updateParams.push(JSON.stringify(recipients)); }
    if (auto_export !== undefined) { updateFields.push('auto_export = ?'); updateParams.push(auto_export ? 1 : 0); }
    if (export_format !== undefined) { updateFields.push('export_format = ?'); updateParams.push(export_format); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); updateParams.push(is_active ? 1 : 0); }

    if (schedule_freq !== undefined || schedule_day !== undefined || schedule_time !== undefined) {
      const currentSchedule = schedules[0];
      const freq = schedule_freq || currentSchedule.schedule_freq;
      const day = schedule_day !== undefined ? schedule_day : (currentSchedule.schedule_day || 0);
      const time = schedule_time || currentSchedule.schedule_time;

      updateFields.push('next_run_at = ?');
      updateParams.push(calculateNextRun(freq, day, time));
    }

    if (updateFields.length > 0) {
      updateParams.push(id);
      await query(
        'UPDATE report_schedules SET ' + updateFields.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        updateParams
      );
    }

    const updatedSchedules = await query('SELECT * FROM report_schedules WHERE id = ?', [id]) as ReportSchedule[];
    const updatedSchedule = updatedSchedules[0];

    return NextResponse.json({
      success: true,
      message: '调度已更新',
      data: {
        ...updatedSchedule,
        recipients: typeof updatedSchedule.recipients === 'string' ? JSON.parse(updatedSchedule.recipients) : updatedSchedule.recipients
      }
    });

  } catch (error: any) {
    console.error('更新调度失败:', error);
    return NextResponse.json(
      { error: '更新调度失败', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId && userId !== 0) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的调度ID' }, { status: 400 });
    }

    const schedules = await query(
      'SELECT id FROM report_schedules WHERE id = ? AND created_by = ?',
      [id, userId]
    ) as any[];

    if (schedules.length === 0) {
      return NextResponse.json({ error: '调度不存在或无权访问' }, { status: 404 });
    }

    await query('DELETE FROM report_schedules WHERE id = ? AND created_by = ?', [id, userId]);

    return NextResponse.json({
      success: true,
      message: '调度已删除',
      deleted_id: id
    });

  } catch (error: any) {
    console.error('删除调度失败:', error);
    return NextResponse.json(
      { error: '删除调度失败', details: error.message },
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
