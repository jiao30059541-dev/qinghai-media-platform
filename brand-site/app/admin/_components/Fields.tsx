export function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = 'text',
  className = '',
  min,
  step,
}: {
  label: string
  name: string
  defaultValue?: string | number | null
  placeholder?: string
  required?: boolean
  type?: string
  className?: string
  min?: number
  step?: number
}) {
  return (
    <label className={`grid gap-1.5 text-xs font-bold text-black/60 ${className}`}>
      {label}
      <input
        className="admin-input text-sm font-normal text-black"
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
      />
    </label>
  )
}

export function TextareaField({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  rows = 4,
  className = '',
}: {
  label: string
  name: string
  defaultValue?: string | null
  placeholder?: string
  required?: boolean
  rows?: number
  className?: string
}) {
  return (
    <label className={`grid gap-1.5 text-xs font-bold text-black/60 ${className}`}>
      {label}
      <textarea
        className="admin-input min-h-[96px] resize-y text-sm font-normal leading-6 text-black"
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </label>
  )
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  className = '',
}: {
  label: string
  name: string
  defaultValue?: string
  options: Array<{ value: string; label: string }>
  className?: string
}) {
  return (
    <label className={`grid gap-1.5 text-xs font-bold text-black/60 ${className}`}>
      {label}
      <select className="admin-input text-sm font-normal text-black" name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function CheckField({
  label,
  name,
  defaultChecked,
}: {
  label: string
  name: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} value="true" className="h-4 w-4 accent-signal" />
      {label}
    </label>
  )
}

export function SaveButton({ label = '保存更改' }: { label?: string }) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-10 items-center justify-center bg-[#16191d] px-5 text-sm font-black text-white hover:bg-signal"
    >
      {label}
    </button>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="mono text-[9px] font-bold tracking-[0.13em] text-signal">{eyebrow}</span>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
        {description && <p className="mt-2 max-w-[760px] text-sm leading-6 text-black/45">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已下线',
    new: '新询盘',
    contacted: '已联系',
    quoted: '已报价',
    won: '已成交',
    lost: '未成交',
    available: '可预约',
    limited: '少量可约',
    full: '已满档',
    closed: '停止投放',
    ask: '咨询确认',
    sent: '已通知',
    failed: '通知失败',
    not_configured: '未配置通知',
    pending: '待通知',
  }
  return (
    <span className="inline-flex whitespace-nowrap bg-black/[0.06] px-2 py-1 text-[10px] font-bold text-black/60">
      {labels[status] || status}
    </span>
  )
}
