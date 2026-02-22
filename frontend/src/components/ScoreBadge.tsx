interface ScoreBadgeProps {
  label: string
  value?: string | number
  type?: 'nutriscore' | 'nova' | 'eco'
}

const nutriscoreColors: Record<string, string> = {
  a: 'bg-green-600',
  b: 'bg-lime-500',
  c: 'bg-yellow-400 text-neutral-900',
  d: 'bg-orange-500',
  e: 'bg-red-600',
}

const novaColors: Record<number, string> = {
  1: 'bg-green-600',
  2: 'bg-lime-500',
  3: 'bg-orange-500',
  4: 'bg-red-600',
}

const novaLabels: Record<number, string> = {
  1: 'Unprocessed',
  2: 'Culinary',
  3: 'Processed',
  4: 'Ultra-proc.',
}

const VALID_GRADES = new Set(['a', 'b', 'c', 'd', 'e'])

export default function ScoreBadge({ label, value, type }: ScoreBadgeProps) {
  const normalized = String(value ?? '').toLowerCase().trim()
  const isInvalid =
    value === undefined ||
    value === null ||
    normalized === '' ||
    normalized === 'unknown' ||
    normalized === 'not-applicable' ||
    normalized === 'not_applicable' ||
    (type !== 'nova' && !VALID_GRADES.has(normalized))

  if (isInvalid) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-lg">
          ?
        </div>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
    )
  }

  let colorClass = 'bg-neutral-700'
  let display: string = String(value).toUpperCase()
  let subtitle = ''

  if (type === 'nutriscore') {
    colorClass = nutriscoreColors[String(value).toLowerCase()] ?? 'bg-neutral-700'
  } else if (type === 'nova') {
    const n = Number(value)
    colorClass = novaColors[n] ?? 'bg-neutral-700'
    subtitle = novaLabels[n] ?? ''
  } else if (type === 'eco') {
    colorClass = nutriscoreColors[String(value).toLowerCase()] ?? 'bg-neutral-700'
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center text-white font-bold text-xl`}>
        {display}
      </div>
      <span className="text-xs text-neutral-400 text-center leading-tight">
        {label}
        {subtitle && <><br /><span className="text-neutral-500">{subtitle}</span></>}
      </span>
    </div>
  )
}
