import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ScannerPage from './pages/ScannerPage'
import ProductPage from './pages/ProductPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<ScannerPage />} />
        <Route path="/product/:barcode" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  )
}
