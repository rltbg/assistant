import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { ArrowLeft, ScanLine } from 'lucide-react'

export default function ScannerPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'init' | 'scanning' | 'error'>('init')
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const navigatedRef = useRef(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const scanner = new Html5Qrcode('qr-reader', {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
    })
    scannerRef.current = scanner

    const config = { fps: 10, qrbox: { width: 260, height: 100 } }
    const onSuccess = (decodedText: string) => {
      if (navigatedRef.current) return
      navigatedRef.current = true
      scanner.stop().catch(() => {}).finally(() => navigate(`/product/${decodedText}`))
    }
    const onError = () => {}

    const startWithFacingMode = () =>
      scanner.start({ facingMode: 'environment' }, config, onSuccess, onError)

    const startWithCameraId = () =>
      Html5Qrcode.getCameras().then(cameras => {
        if (!cameras?.length) throw new Error('No camera found')
        const cameraId = cameras[cameras.length - 1].id
        return scanner.start(cameraId, config, onSuccess, onError)
      })

    // iOS works best with facingMode; Android works best with camera ID
    // Try facingMode first, fall back to camera enumeration
    startWithFacingMode()
      .catch(() => startWithCameraId())
      .then(() => setStatus('scanning'))
      .catch(() => {
        setStatus('error')
        setError('Could not access camera. Please allow camera access and try again.')
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-neutral-800 transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold text-lg">Scan Barcode</h1>
      </div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12 gap-6">
        <div className="w-full max-w-sm relative">
          <div id="qr-reader" className="rounded-2xl overflow-hidden bg-neutral-900" />

          {status === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-24">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-sm" />
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-brand-400/60 blur-[1px] animate-pulse" />
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          {status === 'init' && (
            <div className="flex items-center gap-2 text-neutral-400">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Starting camera…</span>
            </div>
          )}
          {status === 'scanning' && (
            <div className="flex items-center gap-2 text-neutral-400">
              <ScanLine className="w-4 h-4 text-brand-400" />
              <span className="text-sm">Point camera at a barcode</span>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="text-brand-400 hover:text-brand-300 text-sm underline"
              >
                Go back and enter barcode manually
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
