import { Leaf, Lock, MapPin, ArrowDown, ExternalLink } from 'lucide-react'
import type { AnalysisResult } from '../types/product'

interface CarbonMeterProps {
  result?: AnalysisResult
  onRunAnalysis: () => void
  loading?: boolean
  error?: string | null
}

export default function CarbonMeter({ result, onRunAnalysis, loading, error }: CarbonMeterProps) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-5">
      <div className="flex items-center gap-2">
        <Leaf className="w-4 h-4 text-brand-400" />
        <h3 className="font-semibold text-sm text-neutral-200">Product Journey</h3>
      </div>

      {result ? (
        <div className="space-y-5">
          {/* Lifecycle steps */}
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">Supply chain</p>
            {result.lifecycle.map((step, i) => (
              <div key={i}>
                <div className="flex gap-3">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    {i < result.lifecycle.length - 1 && (
                      <div className="w-px flex-1 bg-neutral-800 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{step.stage}</span>
                      <span className="text-xs text-brand-400">{step.location}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{step.description}</p>
                    {step.transport_to_next && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-neutral-600">
                        <ArrowDown className="w-3 h-3" />
                        <span>{step.transport_to_next}</span>
                        {step.distance_km && (
                          <span className="text-neutral-700">· {step.distance_km.toLocaleString()} km</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <p className="text-sm text-neutral-400 leading-relaxed border-t border-neutral-800 pt-4">
            {result.summary}
          </p>

          {/* Sources */}
          {result.sources.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Sources</p>
              {result.sources.map((source, i) => (
                <a
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{source.title}</span>
                </a>
              ))}
            </div>
          )}

          <button
            onClick={onRunAnalysis}
            disabled={loading}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Re-run analysis
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <p className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Trace where this product comes from
            </p>
          )}

          <button
            onClick={onRunAnalysis}
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : (
              <>
                <Leaf className="w-5 h-5" />
                Trace Journey
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
