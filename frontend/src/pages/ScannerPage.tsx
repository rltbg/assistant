import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { ArrowLeft } from 'lucide-react'

export default function ScannerPage() {
  const navigate = useNavigate()
  const navigatedRef = useRef(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false,
    )
    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        if (navigatedRef.current) return
        navigatedRef.current = true
        scanner.clear().catch(() => {}).finally(() => {
          navigate(`/product/${decodedText}`)
        })
      },
      () => {}, // ignore per-frame errors
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <style>{`
        #qr-reader { border: none !important; background: transparent !important; }
        #qr-reader__header_message { color: #a3a3a3 !important; font-size: 0.8rem !important; }
        #qr-reader__status_span { color: #a3a3a3 !important; font-size: 0.8rem !important; }
        #qr-reader__camera_selection { background: #262626 !important; color: #e5e5e5 !important; border: 1px solid #404040 !important; border-radius: 8px !important; padding: 6px 10px !important; }
        #qr-reader__camera_permission_button, #qr-reader__camera_start_button { background: #f97316 !important; color: white !important; border: none !important; border-radius: 10px !important; padding: 10px 20px !important; font-weight: 600 !important; cursor: pointer !important; }
        #qr-reader__dashboard_section_swaplink { color: #f97316 !important; }
        #qr-reader video { border-radius: 12px !important; }
        #qr-reader img { display: none !important; }
      `}</style>

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

      {/* Scanner */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4">
        <div className="w-full max-w-sm">
          <div id="qr-reader" className="rounded-2xl overflow-hidden" />
        </div>
      </div>
    </div>
  )
}
