import type { Product } from '../types/product'

export async function fetchProduct(barcode: string): Promise<Product> {
  const res = await fetch(`/api/product/${barcode}`)
  if (res.status === 404) throw new Error('Product not found')
  if (!res.ok) throw new Error('Failed to fetch product')
  return res.json()
}
