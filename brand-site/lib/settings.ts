import { prisma } from '@/lib/prisma'

export async function getSetting(key: string) {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } })
    return row?.value || ''
  } catch {
    return ''
  }
}

export async function getSettings(keys: string[]) {
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
    return Object.fromEntries(rows.map((row) => [row.key, row.value]))
  } catch {
    return {}
  }
}
