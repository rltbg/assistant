import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf, AlertTriangle, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { fetchProduct } from '../api/product'
import type { Product } from '../types/product'
import ScoreBadge from '../components/ScoreBadge'
import NutrientLevelBar from '../components/NutrientLevelBar'
import CarbonMeter from '../components/CarbonMeter'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-64 bg-neutral-800 rounded-2xl" />
      <div className="h-7 bg-neutral-800 rounded-xl w-2/3" />
      <div className="h-5 bg-neutral-800 rounded-xl w-1/3" />
      <div className="flex gap-4 pt-2">
        {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 bg-neutral-800 rounded-xl" />)}
      </div>
      <div className="h-32 bg-neutral-800 rounded-2xl" />
      <div className="h-48 bg-neutral-800 rounded-2xl" />
    </div>
  )
}

export default function ProductPage() {
  const { barcode } = useParams<{ barcode: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showIngredients, setShowIngredients] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (!barcode) return
    setLoading(true)
    setError(null)
    fetchProduct(barcode)
      .then(setProduct)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [barcode])

  function handleRunAnalysis() {
    setAnalysisLoading(true)
    // Placeholder — AI analysis to be implemented
    setTimeout(() => setAnalysisLoading(false), 2000)
  }

  const name = product?.product_name_fr || product?.product_name || product?.product_name_en || 'Unknown product'
  const brand = product?.brands?.split(',')[0].trim() ?? ''
  const ingredients = product?.ingredients_text_fr || product?.ingredients_text || ''
  const allergens = product?.allergens_tags?.map(t => t.replace(/^en:/, '').replace(/-/g, ' ')).filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-4 pt-12 pb-3 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-900">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-neutral-800 transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-brand-400" />
          <span className="text-brand-400 font-bold tracking-tight">EcoTrace</span>
        </div>
        {barcode && (
          <span className="ml-auto text-neutral-600 text-xs font-mono">{barcode}</span>
        )}
      </div>

      <div className="px-4 pb-12 space-y-4 max-w-lg mx-auto">
        {loading && (
          <div className="pt-6">
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <div className="pt-12 flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Product not found</h2>
            <p className="text-neutral-400 text-sm">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-brand-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && product && (
          <>
            {/* Product image */}
            <div className="pt-4">
              {product.image_front_url ? (
                <div className="relative rounded-2xl overflow-hidden bg-neutral-900 h-64">
                  <img
                    src={product.image_front_url}
                    alt={name}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="rounded-2xl bg-neutral-900 h-40 flex items-center justify-center text-neutral-700">
                  <span className="text-5xl">📦</span>
                </div>
              )}
            </div>

            {/* Product identity */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white leading-tight">{name}</h1>
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                {brand && <span className="font-medium text-neutral-300">{brand}</span>}
                {brand && product.quantity && <span>·</span>}
                {product.quantity && <span>{product.quantity}</span>}
              </div>
            </div>

            {/* Scores */}
            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-4">Quality scores</p>
              <div className="flex justify-around">
                <ScoreBadge
                  label="Nutri-Score"
                  value={product.nutriscore_grade}
                  type="nutriscore"
                />
                <ScoreBadge
                  label="NOVA group"
                  value={product.nova_group}
                  type="nova"
                />
                <ScoreBadge
                  label="Eco-Score"
                  value={product.ecoscore_grade === 'unknown' ? undefined : product.ecoscore_grade}
                  type="eco"
                />
              </div>
            </div>

            {/* Nutrition table */}
            {product.nutriments && (
              <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-4">Nutrition per 100g</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Calories', value: product.nutriments['energy-kcal_100g'], unit: ' kcal' },
                    { label: 'Fat', value: product.nutriments.fat_100g, unit: 'g' },
                    { label: 'Carbs', value: product.nutriments.carbohydrates_100g, unit: 'g' },
                    { label: 'Sugars', value: product.nutriments.sugars_100g, unit: 'g' },
                    { label: 'Proteins', value: product.nutriments.proteins_100g, unit: 'g' },
                    { label: 'Salt', value: product.nutriments.salt_100g, unit: 'g' },
                  ].map(({ label, value, unit }) => (
                    value !== undefined && (
                      <div key={label} className="bg-neutral-800/60 rounded-xl p-3">
                        <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
                        <p className="text-white font-semibold">{value}{unit}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Nutrient levels */}
            {product.nutrient_levels && Object.keys(product.nutrient_levels).length > 0 && (
              <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 space-y-3">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Nutrient levels</p>
                <NutrientLevelBar
                  label="Fat"
                  level={product.nutrient_levels.fat}
                  value={product.nutriments?.fat_100g}
                />
                <NutrientLevelBar
                  label="Saturated fat"
                  level={product.nutrient_levels['saturated-fat']}
                  value={product.nutriments?.['saturated-fat_100g']}
                />
                <NutrientLevelBar
                  label="Sugars"
                  level={product.nutrient_levels.sugars}
                  value={product.nutriments?.sugars_100g}
                />
                <NutrientLevelBar
                  label="Salt"
                  level={product.nutrient_levels.salt}
                  value={product.nutriments?.salt_100g}
                />
              </div>
            )}

            {/* Allergens */}
            {allergens.length > 0 && (
              <div className="bg-orange-950/40 border border-orange-900/50 rounded-2xl p-4">
                <p className="text-xs text-orange-400 uppercase tracking-wide mb-2 font-medium">Contains allergens</p>
                <div className="flex flex-wrap gap-2">
                  {allergens.map(a => (
                    <span key={a} className="text-xs bg-orange-900/50 text-orange-300 px-2.5 py-1 rounded-full capitalize">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {ingredients && (
              <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
                <button
                  onClick={() => setShowIngredients(v => !v)}
                  className="w-full flex items-center justify-between"
                >
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Ingredients</p>
                  {showIngredients ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
                {showIngredients && (
                  <p className="text-sm text-neutral-300 leading-relaxed mt-3">{ingredients}</p>
                )}
                {!showIngredients && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{ingredients}</p>
                )}
              </div>
            )}

            {/* Origin */}
            {(product.origins || product.manufacturing_places) && (
              <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-neutral-500" />
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Origin</p>
                </div>
                {product.origins && <p className="text-sm text-neutral-300">{product.origins}</p>}
                {product.manufacturing_places && (
                  <p className="text-sm text-neutral-400">{product.manufacturing_places}</p>
                )}
              </div>
            )}

            {/* Carbon Meter */}
            <CarbonMeter
              onRunAnalysis={handleRunAnalysis}
              loading={analysisLoading}
            />
          </>
        )}
      </div>
    </div>
  )
}
