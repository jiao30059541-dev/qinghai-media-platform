export type LeadNotificationPayload = {
  id: number
  name: string
  phone: string
  company?: string | null
  screenInterest?: string | null
  campaignDate?: string | null
  budget?: string | null
  message?: string | null
  source: string
  createdAt: Date
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function sendWebhook(lead: LeadNotificationPayload) {
  const url = process.env.LEAD_NOTIFICATION_WEBHOOK_URL
  if (!url) return false

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'text',
      text: {
        content: [
          '官网收到新的投放咨询',
          `姓名：${lead.name}`,
          `电话：${lead.phone}`,
          `公司：${lead.company || '未填写'}`,
          `意向：${lead.screenInterest || '未选择'}`,
          `计划：${lead.campaignDate || '未填写'}`,
          `来源：${lead.source}`,
          `需求：${lead.message || '未填写'}`,
        ].join('\n'),
      },
      lead: {
        ...lead,
        createdAt: lead.createdAt.toISOString(),
      },
    }),
    signal: AbortSignal.timeout(5000),
  })

  return response.ok
}

async function sendEmail(lead: LeadNotificationPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.LEAD_NOTIFICATION_EMAIL
  if (!apiKey || !to) return false

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.LEAD_NOTIFICATION_FROM || 'nameyang@xnmytx.com',
      to: [to],
      subject: `新投放咨询：${lead.name} · ${lead.phone}`,
      html: `
        <h2>官网收到新的投放咨询</h2>
        <p><strong>姓名：</strong>${escapeHtml(lead.name)}</p>
        <p><strong>电话：</strong>${escapeHtml(lead.phone)}</p>
        <p><strong>公司：</strong>${escapeHtml(lead.company || '未填写')}</p>
        <p><strong>意向：</strong>${escapeHtml(lead.screenInterest || '未选择')}</p>
        <p><strong>计划：</strong>${escapeHtml(lead.campaignDate || '未填写')}</p>
        <p><strong>来源：</strong>${escapeHtml(lead.source)}</p>
        <p><strong>需求：</strong>${escapeHtml(lead.message || '未填写')}</p>
      `,
    }),
    signal: AbortSignal.timeout(5000),
  })

  return response.ok
}

export async function notifyNewLead(lead: LeadNotificationPayload) {
  const configured = Boolean(
    process.env.LEAD_NOTIFICATION_WEBHOOK_URL ||
      (process.env.RESEND_API_KEY && process.env.LEAD_NOTIFICATION_EMAIL)
  )

  if (!configured) return 'not_configured'

  const results = await Promise.allSettled([sendWebhook(lead), sendEmail(lead)])
  const delivered = results.some(
    (result) => result.status === 'fulfilled' && result.value === true
  )
  return delivered ? 'sent' : 'failed'
}
