// 测试AI解析全流程
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3003';

async function main() {
  // Step 1: 创建或登录测试供应商
  console.log('=== STEP 1: 创建测试供应商 ===');
  let r = await jsonRequest('POST', '/api/supplier/apply', {
    company_name: '青海测试广告传媒',
    contact_name: '测试张经理',
    phone: '13800009996',
    email: 'test3@test.com',
    city: '西宁',
    media_type: 'LED大屏',
    description: '测试用',
  });
  if (r.data?.success) {
    var token = r.data.token;
    console.log('✓ 新供应商创建成功');
  } else if (r.data?.message && r.data.message.includes('已注册')) {
    // 直接用已有用户
    r = await jsonRequest('POST', '/api/auth/supplier-login', { phone: '13800009996', code: '000000' });
    token = r.data?.token || '';
    console.log('使用已有用户');
  } else if (r.data?.token) {
    token = r.data.token;
  } else {
    console.log('Apply:', JSON.stringify(r.data).slice(0, 200));
    // 尝试用 test-credentials 的方式
    return;
  }

  if (!token) {
    console.log('无法获取token，退出');
    return;
  }
  console.log('Token:', token.slice(0,30) + '...');

  // Step 2: 测图片识别
  console.log('\n=== STEP 2: 图片AI识别 ===');
  const imgPath = '/tmp/test-ad-led.jpg';
  if (fs.existsSync(imgPath)) {
    r = await uploadParse(token, imgPath, 'image/jpeg');
    console.log('状态:', r.status);
    if (r.data?.success) {
      console.log('✓ 图片识别成功！');
      console.log('  名称:', r.data.data.name);
      console.log('  城市:', r.data.data.city);
      console.log('  类型:', r.data.data.category_level2);
      console.log('  价格: ¥' + r.data.data.list_price + ' / ¥' + r.data.data.deal_price);
      console.log('  尺寸:', r.data.data.size);
      console.log('  描述:', r.data.data.description);
    } else {
      console.log('失败:', JSON.stringify(r.data).slice(0, 300));
    }
  }

  // Step 3: 测PDF识别
  console.log('\n=== STEP 3: PDF AI识别 ===');
  const pdfPath = '/tmp/test-ad-brochure.pdf';
  if (fs.existsSync(pdfPath)) {
    r = await uploadParse(token, pdfPath, 'application/pdf');
    console.log('状态:', r.status);
    if (r.data?.success) {
      console.log('✓ PDF识别成功！');
      console.log('  名称:', r.data.data.name);
      console.log('  城市:', r.data.data.city);
      console.log('  类型:', r.data.data.category_level2);
      console.log('  价格: ¥' + r.data.data.list_price + ' / ¥' + r.data.data.deal_price);
      console.log('  尺寸:', r.data.data.size);
      console.log('  描述:', r.data.data.description);
      if (r.data.ocr_text) console.log('  OCR片段:', r.data.ocr_text.slice(0, 120));
    } else {
      console.log('失败:', JSON.stringify(r.data).slice(0, 500));
    }
  }
}

function jsonRequest(method, p, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(p, BASE);
    const req = http.request({
      hostname: url.hostname, port: url.port,
      path: url.pathname, method,
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, raw: data.slice(0,500) }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function uploadParse(token, fp, mime) {
  return new Promise((resolve, reject) => {
    const buf = fs.readFileSync(fp);
    const boundary = '----B' + Date.now();
    const body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\n'),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="' + path.basename(fp) + '"\r\n'),
      Buffer.from('Content-Type: ' + mime + '\r\n\r\n'),
      buf,
      Buffer.from('\r\n--' + boundary + '--\r\n'),
    ]);
    const url = new URL('/api/supplier/media/ai-parse', BASE);
    const req = http.request({
      hostname: url.hostname, port: url.port,
      path: url.pathname, method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'Bearer ' + token,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, raw: data.slice(0,500) }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

main().catch(console.error);
