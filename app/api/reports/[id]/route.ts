import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

interface Report {
  id: number;
  title: string;
  report_type: string;
  date_range: string;
  start_date: string | null;
  end_date: string | null;
  filters: any;
  generated_by: number;
  status: string;
  file_path: string | null;
  file_format: string | null;
  file_size: number | null;
  summary_data: any;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// 获取单个报表详情
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
      return NextResponse.json({ error: '无效的报表ID' }, { status: 400 });
    }

    // 获取报表记录（确保只能访问自己的报表或管理员可访问所有）
    const reports = await query(
      'SELECT * FROM reports WHERE id = ? AND generated_by = ?',
      [id, userId]
    ) as Report[];

    if (reports.length === 0) {
      return NextResponse.json({ error: '报表不存在或无权访问' }, { status: 404 });
    }

    const report = reports[0];

    // 尝试解析 summary_data
    let summaryData = report.summary_data;
    if (typeof summaryData === 'string') {
      try {
        summaryData = JSON.parse(summaryData);
      } catch {
        summaryData = null;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        summary_data: summaryData
      }
    });

  } catch (error: any) {
    console.error('获取报表详情失败:', error);
    return NextResponse.json(
      { error: '获取报表详情失败', details: error.message },
      { status: 500 }
    );
  }
}

// 删除单个报表
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
      return NextResponse.json({ error: '无效的报表ID' }, { status: 400 });
    }

    // 先检查是否存在且属于当前用户
    const reports = await query(
      'SELECT id, file_path FROM reports WHERE id = ? AND generated_by = ?',
      [id, userId]
    ) as any[];

    if (reports.length === 0) {
      return NextResponse.json({ error: '报表不存在或无权访问' }, { status: 404 });
    }

    const report = reports[0];

    // 删除数据库记录
    const deleteResult = await query(
      'DELETE FROM reports WHERE id = ? AND generated_by = ?',
      [id, userId]
    ) as any;

    // 返回成功
    return NextResponse.json({
      success: true,
      message: '报表已删除',
      deleted_id: id
    });

  } catch (error: any) {
    console.error('删除报表失败:', error);
    return NextResponse.json(
      { error: '删除报表失败', details: error.message },
      { status: 500 }
    );
  }
}

// 更新报表（支持重新生成等操作）
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
      return NextResponse.json({ error: '无效的报表ID' }, { status: 400 });
    }

    // 检查是否存在且属于当前用户
    const reports = await query(
      'SELECT * FROM reports WHERE id = ? AND generated_by = ?',
      [id, userId]
    ) as Report[];

    if (reports.length === 0) {
      return NextResponse.json({ error: '报表不存在或无权访问' }, { status: 404 });
    }

    const body = await request.json();
    const { title, report_type, date_range, start_date, end_date, filters, regenerate } = body;

    // 构建更新字段
    const updateFields: string[] = [];
    const updateParams: any[] = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateParams.push(title);
    }
    if (report_type !== undefined) {
      updateFields.push('report_type = ?');
      updateParams.push(report_type);
    }
    if (date_range !== undefined) {
      updateFields.push('date_range = ?');
      updateParams.push(date_range);
    }
    if (start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateParams.push(start_date);
    }
    if (end_date !== undefined) {
      updateFields.push('end_date = ?');
      updateParams.push(end_date);
    }
    if (filters !== undefined) {
      updateFields.push('filters = ?');
      updateParams.push(JSON.stringify(filters));
    }

    if (updateFields.length > 0) {
      updateParams.push(id);
      await query(
        'UPDATE reports SET ' + updateFields.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        updateParams
      );
    }

    // 如果要求重新生成
    if (regenerate) {
      await query(
        'UPDATE reports SET status = pending, summary_data = NULL, error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      // 异步触发重新生成（这里可以触发后台任务）
      // 实际项目中可以在这里触发异步队列或直接调用analytics API
      // 对于同步调用，可以参考POST中的逻辑
    }

    // 返回更新后的报表
    const updatedReports = await query('SELECT * FROM reports WHERE id = ?', [id]) as Report[];
    const updatedReport = updatedReports[0];

    let summaryData = updatedReport.summary_data;
    if (typeof summaryData === 'string') {
      try {
        summaryData = JSON.parse(summaryData);
      } catch {
        summaryData = null;
      }
    }

    return NextResponse.json({
      success: true,
      message: '报表已更新' + (regenerate ? '，已标记为重新生成' : ''),
      data: {
        ...updatedReport,
        summary_data: summaryData
      }
    });

  } catch (error: any) {
    console.error('更新报表失败:', error);
    return NextResponse.json(
      { error: '更新报表失败', details: error.message },
      { status: 500 }
    );
  }
}
