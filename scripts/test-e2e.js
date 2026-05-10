// 完整端到端测试：图片OCR→AI解析→创建媒体→PDF解析→创建媒体
const http = require('http');
const fs = require('fs');
const path = require('path');
const BASE = 'http://localhost:3003';

async function main() {
  console.log('=== STEP 1: 创建测试供应商 ===');
  let r = await json('POST', '/api/supplier/apply', {
    company_name: '青海测试广告',
    contact_name: '张测试',
    phone: '13800009994',
    email: 'test5@test.com',
    city: '西宁', media_type: 'LED', description: '测试',
  });
  let token = r.data?.token || '';
  if (!token) { console.log('创建失败:', r.status); return; }
  console.log('✓ Token:', token.slice(0,25) + '...');

  // 图片测试
  console.log('\n=== STEP 2: 图片AI识别（含中文文字） ===');
  r = await upload(token, '/tmp/test-ad-chinese.jpg', 'image/jpeg');
  console.log('状态:', r.status);
  if (r.data?.success) {
    console.log('✓ AI识别结果:');
    console.log('  名称:', r.data.data.name);
    console.log('  城市:', r.data.data.city);
    console.log('  类型:', r.data.data.category_level2);
    console.log('  挂牌价:', r.data.data.list_price);
    console.log('  成交价:', r.data.data.deal_price);
    console.log('  描述:', r.data.data.description);
    
    // 创建媒体
    const d = r.data.data;
    r = await json('POST', '/api/supplier/media', {
      name: d.name || '西宁LED大屏', city: d.city || '西宁',
      address: d.address || '', category_level2: d.category_level2 || 'LED大屏',
      list_price: d.list_price || 35000, deal_price: d.deal_price || 28000,
      floor_price: Math.round((d.deal_price || 28000) * 0.8),
      size: d.size || '', daily_exposure: d.daily_exposure || 0,
      description: d.description || '',
    }, token);
    console.log('创建媒体:', r.data?.success ? '✓ ID:'+r.data.data?.id : '✗ '+JSON.stringify(r.data).slice(0,100));
  } else {
    console.log('✗', JSON.stringify(r.data).slice(0,200));
  }

  // PDF测试
  console.log('\n=== STEP 3: PDF AI识别 ===');
  r = await upload(token, '/tmp/test-ad-brochure.pdf', 'application/pdf');
  console.log('状态:', r.status);
  if (r.data?.success) {
    console.log('✓ PDF识别结果:');
    console.log('  名称:', r.data.data.name);
    console.log('  城市:', r.data.data.city || '(未识别)');
    console.log('  类型:', r.data.data.category_level2);
    console.log('  挂牌价:', r.data.data.list_price);
    console.log('  成交价:', r.data.data.deal_price);
    console.log('  描述:', r.data.data.description);
    
    const d = r.data.data;
    r = await json('POST', '/api/supplier/media', {
      name: d.name || 'LED大屏', city: d.city || '西宁',
      address: d.address || '', category_level2: d.category_level2 || 'LED大屏',
      list_price: d.list_price || 35000, deal_price: d.deal_price || 28000,
      floor_price: Math.round((d.deal_price || 28000) * 0.8),
      size: d.size || '', daily_exposure: d.daily_exposure || 100000,
      description: d.description || '',
    }, token);
    console.log('创建媒体:', r.data?.success ? '✓ ID:'+r.data.data?.id : '✗ '+JSON.stringify(r.data).slice(0,100));
  } else {
    console.log('✗', JSON.stringify(r.data).slice(0,300));
  }

  console.log('\n=== 全部测试完成 ===');
}

function json(method, p, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(p, BASE);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method, headers }, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, raw: data.slice(0,500) }); } });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function upload(token, fp, mime) {
  return new Promise((resolve, reject) => {
    const buf = fs.readFileSync(fp);
    const boundary = '----B' + Date.now();
    const body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\n'),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="' + path.basename(fp) + '"\r\n'),
      Buffer.from('Content-Type: ' + mime + '\r\n\r\n'), buf,
      Buffer.from('\r\n--' + boundary + '--\r\n'),
    ]);
    const url = new URL('/api/supplier/media/ai-parse', BASE);
    const req = http.request({
      hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Authorization': 'Bearer ' + token, 'Content-Length': body.length },
    }, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, raw: data.slice(0,500) }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

main().catch(console.error);
