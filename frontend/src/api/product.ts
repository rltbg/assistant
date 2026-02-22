import type { Product, AnalysisResult } from '../types/product'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchProduct(barcode: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/product/${barcode}`)
  if (res.status === 404) throw new Error('Product not found')
  if (!res.ok) throw new Error('Failed to fetch product')
  return res.json()
}

export interface AnalyzePayload {
  product_name: string
  brand: string
  ingredients: string
  origins: string
  user_location: string
  quantity: string
  ecoscore_grade: string
}

export async function analyzeProduct(payload: AnalyzePayload): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Analysis failed')
  }
  return res.json()
}
