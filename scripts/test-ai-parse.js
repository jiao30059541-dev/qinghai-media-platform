// 测试AI解析全流程 - 直接用数据库获取的token测试
const http = require('http');
const fs = require('fs');
const mysql = require('mysql2/promise');

const BASE = 'http://localhost:3003';

async function main() {
  // Step 1: Login as supplier - get token from DB
  console.log('=== STEP 1: Login as test supplier ===');
  
  // First, try registering a fresh supplier
  const r = await request('POST', '/api/supplier/apply', {
    company_name: '青海测试广告传媒有限公司',
    contact_name: '测试供应商',
    phone: '13800009997',  // fresh number
    email: 'test2@test.com',
    city: '西宁',
    media_type: 'LED大屏、户外广告',
    description: '测试供应商，拥有西宁核心商圈LED大屏',
  });
  console.log('Apply status:', r.status);
  if (r.data?.success) {
    console.log('✓ New supplier created!');
    console.log('Token:', r.data.token.slice(0, 30) + '...');
    var token = r.data.token;
  } else {
    console.log('Apply result:', JSON.stringify(r.data).slice(0, 200));
    return;
  }

  // Step 2: Test AI Parse with image
  console.log('\n=== STEP 2: AI识别图片 ===');
  const imgPath = '/tmp/test-ad-led.jpg';
  if (fs.existsSync(imgPath)) {
    const r2 = await uploadAndParse(token, imgPath, 'image/jpeg');
    console.log('Status:', r2.status);
    if (r2.data?.success) {
      console.log('✓ AI图片识别成功！');
      console.log('  名称:', r2.data.data.name);
      console.log('  城市:', r2.data.data.city);
      console.log('  类型:', r2.data.data.category_level2);
      console.log('  价格: ¥' + r2.data.data.list_price + ' / ¥' + r2.data.data.deal_price);
      console.log('  尺寸:', r2.data.data.size);
      console.log('  描述:', r2.data.data.description);
    } else {
      console.log('Failed:', JSON.stringify(r2.data).slice(0, 300));
    }
  }

  // Step 3: Test AI Parse with PDF
  console.log('\n=== STEP 3: AI识别PDF ===');
  const pdfPath = '/tmp/test-ad-brochure.pdf';
  if (fs.existsSync(pdfPath)) {
    const r3 = await uploadAndParse(token, pdfPath, 'application/pdf');
    console.log('Status:', r3.status);
    if (r3.data?.success) {
      console.log('✓ PDF AI识别成功！');
      console.log('  名称:', r3.data.data.name);
      console.log('  城市:', r3.data.data.city);
      console.log('  类型:', r3.data.data.category_level2);
      console.log('  价格: ¥' + r3.data.data.list_price + ' / ¥' + r3.data.data.deal_price);
      console.log('  尺寸:', r3.data.data.size);
      console.log('  描述:', r3.data.data.description);
      console.log('  OCR文本(前100字):', (r3.data.ocr_text || '').slice(0, 100));
    } else {
      console.log('Failed:', JSON.stringify(r3.data).slice(0, 400));
    }
  }
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname, port: url.port,
      path: url.pathname, method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, raw: data.slice(0,500) }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function uploadAndParse(token, filePath, mimeType) {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(filePath);
    const boundary = '----Boundary' + Date.now();
    
    let body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\n'),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="' + require('path').basename(filePath) + '"\r\n'),
      Buffer.from('Content-Type: ' + mimeType + '\r\n\r\n'),
      fileBuffer,
      Buffer.from('\r\n--' + boundary + '--\r\n'),
    ]);

    const url = new URL('/api/supplier/media/ai-parse', BASE);
    const options = {
      hostname: url.hostname, port: url.port,
      path: url.pathname, method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'Bearer ' + token,
        'Content-Length': body.length,
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
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
