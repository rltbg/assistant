import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, MapPin, ArrowRight, Leaf } from 'lucide-react'
import LocationPicker from '../components/LocationPicker'
import type { Location } from '../types/product'

function MountainBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
      </defs>
      <rect width="390" height="844" fill="url(#bgGrad)" />
      {/* Far mountains */}
      <path d="M-50 844 L-50 480 L60 360 L160 430 L240 300 L330 400 L410 320 L490 380 L490 844 Z" fill="rgba(0,0,0,0.12)" />
      {/* Mid mountains */}
      <path d="M-50 844 L-50 560 L40 490 L120 540 L210 440 L300 510 L380 460 L490 520 L490 844 Z" fill="rgba(0,0,0,0.22)" />
      {/* Near mountains */}
      <path d="M-50 844 L-50 640 L70 590 L160 630 L250 580 L340 620 L430 600 L490 844 Z" fill="rgba(0,0,0,0.32)" />
      {/* Foreground */}
      <path d="M-50 844 L-50 730 L100 710 L200 730 L310 705 L410 720 L490 844 Z" fill="rgba(0,0,0,0.45)" />
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [location, setLocation] = useState<Location | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')

  function handleLocationSelect(loc: Location) {
    setLocation(loc)
    localStorage.setItem('ecotrace_location', JSON.stringify(loc))
    setShowLocationPicker(false)
  }

  function handleManualSearch() {
    const code = manualBarcode.trim()
    if (code) navigate(`/product/${code}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MountainBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">EcoTrace</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-16">
          <div className="max-w-md mx-auto w-full space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Sustainability Scanner
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                Know your<br />food's carbon<br />story.
              </h1>
              <p className="text-orange-100/80 text-lg leading-relaxed">
                Scan a barcode to discover the environmental impact of your food choices.
              </p>
            </div>

            {/* Location */}
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <MapPin className="w-4 h-4 group-hover:text-orange-200 transition-colors" />
              <span className="text-sm border-b border-white/30 group-hover:border-white/70 transition-colors pb-px">
                {location ? location.label : 'Set your location'}
              </span>
            </button>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/scan')}
                className="w-full bg-white text-orange-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg hover:bg-orange-50 active:scale-[0.98] transition-all shadow-xl shadow-black/20"
              >
                <Camera className="w-6 h-6" />
                Scan a Product
              </button>

              {/* Manual barcode */}
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter barcode manually…"
                  value={manualBarcode}
                  onChange={e => setManualBarcode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                  className="flex-1 bg-white/15 backdrop-blur-sm text-white placeholder-white/40 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-white/60 transition-colors text-sm"
                />
                <button
                  onClick={handleManualSearch}
                  className="bg-white/15 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/25 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-white/40 text-xs text-center">
              Powered by OpenFoodFacts · Carbon analysis with AI
            </p>
          </div>
        </div>
      </div>

      {showLocationPicker && (
        <LocationPicker
          onSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  )
}
