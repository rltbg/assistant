import type { NutrientLevel } from '../types/product'

interface NutrientLevelBarProps {
  label: string
  level?: NutrientLevel
  value?: number
  unit?: string
}

const levelConfig: Record<NutrientLevel, { color: string; width: string; text: string }> = {
  low:      { color: 'bg-green-500',  width: 'w-1/4',  text: 'Low' },
  moderate: { color: 'bg-yellow-400', width: 'w-1/2',  text: 'Moderate' },
  high:     { color: 'bg-red-500',    width: 'w-full', text: 'High' },
}

export default function NutrientLevelBar({ label, level, value, unit = 'g' }: NutrientLevelBarProps) {
  const config = level ? levelConfig[level] : null

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        {config && (
          <div className={`h-full rounded-full ${config.color} ${config.width} transition-all`} />
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 w-24 justify-end">
        {value !== undefined && (
          <span className="text-sm text-neutral-300">{value}{unit}</span>
        )}
        {config && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            level === 'low' ? 'bg-green-900/60 text-green-400' :
            level === 'moderate' ? 'bg-yellow-900/60 text-yellow-400' :
            'bg-red-900/60 text-red-400'
          }`}>
            {config.text}
          </span>
        )}
      </div>
    </div>
  )
}
