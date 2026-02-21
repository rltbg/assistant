import { useState } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import type { Location } from '../types/product'

interface LocationPickerProps {
  onSelect: (location: Location) => void
  onClose: () => void
}

const POPULAR_LOCATIONS = [
  'Paris, France',
  'London, UK',
  'Berlin, Germany',
  'New York, USA',
  'Tokyo, Japan',
  'Madrid, Spain',
  'Rome, Italy',
  'Amsterdam, Netherlands',
]

export default function LocationPicker({ onSelect, onClose }: LocationPickerProps) {
  const [manual, setManual] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleGPS() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        onSelect({
          label: `${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {
        setLoading(false)
        setError('Location access denied. Enter your location manually.')
      },
      { timeout: 8000 }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-6 pb-safe-bottom space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Your location</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* GPS */}
        <button
          onClick={handleGPS}
          disabled={loading}
          className="w-full flex items-center gap-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          <Navigation className="w-5 h-5 shrink-0" />
          {loading ? 'Getting location...' : 'Use my current location'}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-xs text-neutral-500">or enter manually</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="City, Country"
            value={manual}
            onChange={e => setManual(e.target.value)}
            className="flex-1 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
            onKeyDown={e => e.key === 'Enter' && manual.trim() && onSelect({ label: manual.trim() })}
          />
          <button
            onClick={() => manual.trim() && onSelect({ label: manual.trim() })}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-4 py-3 rounded-xl transition-colors font-medium"
          >
            OK
          </button>
        </div>

        {/* Popular */}
        <div className="space-y-2">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Popular</p>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_LOCATIONS.map(loc => (
              <button
                key={loc}
                onClick={() => onSelect({ label: loc })}
                className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg transition-colors text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
