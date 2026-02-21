import { Leaf, Lock } from 'lucide-react'

interface CarbonMeterProps {
  score?: number // kg CO2 eq, null = not yet computed
  onRunAnalysis: () => void
  loading?: boolean
}

const levels = [
  { max: 0.5,  label: 'Excellent', color: '#22c55e', emoji: '🌿' },
  { max: 1.5,  label: 'Good',      color: '#84cc16', emoji: '✅' },
  { max: 3,    label: 'Moderate',  color: '#eab308', emoji: '⚠️' },
  { max: 6,    label: 'High',      color: '#f97316', emoji: '🔴' },
  { max: Infinity, label: 'Very High', color: '#ef4444', emoji: '💀' },
]

function getLevel(score: number) {
  return levels.find(l => score <= l.max) ?? levels[levels.length - 1]
}

export default function CarbonMeter({ score, onRunAnalysis, loading }: CarbonMeterProps) {
  const computed = score !== undefined

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-4 h-4 text-brand-400" />
        <h3 className="font-semibold text-sm text-neutral-200">Carbon Footprint</h3>
      </div>

      {computed ? (
        <div className="space-y-4">
          {(() => {
            const level = getLevel(score!)
            const pct = Math.min((score! / 6) * 100, 100)
            return (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{score!.toFixed(2)}</span>
                  <span className="text-neutral-400 mb-1">kg CO₂ eq</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: level.color }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{level.emoji}</span>
                  <span className="font-medium" style={{ color: level.color }}>{level.label}</span>
                </div>
              </>
            )
          })()}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Placeholder gauge */}
          <div className="flex items-end gap-2 opacity-30">
            <span className="text-4xl font-bold text-white">—</span>
            <span className="text-neutral-400 mb-1">kg CO₂ eq</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full">
            <div className="h-full w-0 bg-brand-500 rounded-full" />
          </div>
          <p className="text-sm text-neutral-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Run analysis to calculate the carbon footprint
          </p>
        </div>
      )}

      <button
        onClick={onRunAnalysis}
        disabled={loading}
        className="mt-5 w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <Leaf className="w-5 h-5" />
            Run Analysis
          </>
        )}
      </button>
    </div>
  )
}
