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

function escapeCSVField(value: string): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function flattenData(data: any, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};
  if (data === null || data === undefined) return result;
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (typeof item === 'object' && !Array.isArray(item)) {
        Object.assign(result, flattenData(item, prefix + (prefix ? '_' : '') + index));
      } else {
        result[prefix + (prefix ? '_' : '') + index] = item;
      }
    });
  } else if (typeof data === 'object') {
    for (const key of Object.keys(data)) {
      const newPrefix = prefix ? prefix + '_' + key : key;
      const value = data[key];
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flattenData(value, newPrefix));
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          value.forEach((item, idx) => {
            Object.assign(result, flattenData(item, newPrefix + '_' + idx));
          });
        } else {
          result[newPrefix] = JSON.stringify(value);
        }
      } else {
        result[newPrefix] = value;
      }
    }
  }
  return result;
}

function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return '';
  const BOM = '\uFEFF';
  const keys = headers || Object.keys(data[0]);
  const csvRows: string[] = [];
  csvRows.push(keys.map(key => escapeCSVField(key)).join(','));
  for (const row of data) {
    const values = keys.map(key => {
      const keysList = key.split('.');
      let val = row;
      for (const k of keysList) {
        if (val === null || val === undefined || typeof val !== 'object') {
          val = '';
          break;
        }
        val = val[k];
      }
      return escapeCSVField(formatValue(val));
    });
    csvRows.push(values.join(','));
  }
  return BOM + csvRows.join('\r\n');
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return proto + '://' + host;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"\/\\|?*]/g, '_').replace(/\s+/g, '_').substring(0, 100);
}

function extractArrayData(data: any): any[] {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data;
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key]) && data[key].length > 0) return data[key];
  }
  return [];
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
      return NextResponse.json({ error: '无效的报表ID' }, { status: 400 });
    }

    const reports = await query(
      'SELECT * FROM reports WHERE id = ? AND generated_by = ?',
      [id, userId]
    ) as Report[];

    if (reports.length === 0) {
      return NextResponse.json({ error: '报表不存在或无权访问' }, { status: 404 });
    }

    const report = reports[0];

    if (report.status !== 'completed') {
      return NextResponse.json({ error: '报表尚未完成生成', status: report.status }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || report.file_format || 'csv';
    const pretty = searchParams.get('pretty') !== 'false';

    let summaryData = report.summary_data;
    if (typeof summaryData === 'string') {
      try { summaryData = JSON.parse(summaryData); } catch { summaryData = null; }
    }

    const exportData = summaryData || {};

    const baseUrl = getBaseUrl(request);
    const analyticsParams = new URLSearchParams();
    analyticsParams.set('report', report.report_type);
    analyticsParams.set('timeframe', report.date_range);
    if (report.start_date) analyticsParams.set('start_date', report.start_date);
    if (report.end_date) analyticsParams.set('end_date', report.end_date);

    let fullData: any = exportData;
    try {
      const analyticsUrl = baseUrl + '/api/analytics?' + analyticsParams.toString();
      const analyticsResponse = await fetch(analyticsUrl, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
          'Authorization': request.headers.get('authorization') || ''
        },
        signal: AbortSignal.timeout(15000)
      });
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success && analyticsResult.data) {
          fullData = analyticsResult.data;
        }
      }
    } catch {
      console.warn('无法获取analytics完整数据，使用摘要数据导出');
    }

    if (format === 'csv') {
      const dataType = searchParams.get('data_type') || 'auto';
      let csvContent = '';
      const filename = sanitizeFilename(report.title) + '_' + report.id + '.csv';

      if (dataType === 'summary' || !fullData) {
        const flatSummary = flattenData(fullData || {});
        csvContent = convertToCSV([flatSummary]);
      } else {
        const arrayData = extractArrayData(fullData);
        if (arrayData.length > 0) {
          csvContent = convertToCSV(arrayData);
        } else {
          csvContent = convertToCSV([flattenData(fullData)]);
        }
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="' + filename + '"',
          'Content-Length': String(Buffer.byteLength(csvContent, 'utf-8'))
        }
      });
    } else if (format === 'json') {
      const filename = sanitizeFilename(report.title) + '_' + report.id + '.json';
      const jsonContent = pretty ? JSON.stringify(fullData, null, 2) : JSON.stringify(fullData);

      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': 'attachment; filename="' + filename + '"',
          'Content-Length': String(Buffer.byteLength(jsonContent, 'utf-8'))
        }
      });
    } else if (format === 'xlsx') {
      return NextResponse.json(
        { error: 'Excel导出需要安装xlsx库，请使用csv或json格式', supported_formats: ['csv', 'json'] },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: '不支持的导出格式', supported_formats: ['csv', 'json', 'xlsx'], requested: format },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('导出报表失败:', error);
    return NextResponse.json(
      { error: '导出报表失败', details: error.message },
      { status: 500 }
    );
  }
}
