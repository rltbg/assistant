export type NutrientLevel = 'low' | 'moderate' | 'high'
export type Grade = 'a' | 'b' | 'c' | 'd' | 'e'

export interface NutrientLevels {
  fat?: NutrientLevel
  salt?: NutrientLevel
  sugars?: NutrientLevel
  'saturated-fat'?: NutrientLevel
}

export interface Nutriments {
  'energy-kcal_100g'?: number
  proteins_100g?: number
  carbohydrates_100g?: number
  fat_100g?: number
  sugars_100g?: number
  salt_100g?: number
  fiber_100g?: number
  'saturated-fat_100g'?: number
}

export interface Product {
  _id?: string
  product_name?: string
  product_name_fr?: string
  product_name_en?: string
  brands?: string
  quantity?: string
  image_front_url?: string
  image_front_small_url?: string
  nutriscore_grade?: string
  nova_group?: number
  ecoscore_grade?: string
  nutrient_levels?: NutrientLevels
  nutriments?: Nutriments
  ingredients_text?: string
  ingredients_text_fr?: string
  allergens_tags?: string[]
  origins?: string
  origins_tags?: string[]
  manufacturing_places?: string
  countries?: string
  countries_tags?: string[]
  categories?: string
  categories_tags?: string[]
  labels_tags?: string[]
  conservation_conditions?: string
}

export interface Location {
  label: string
  lat?: number
  lng?: number
}

export interface LifecycleStep {
  stage: string
  location: string
  description: string
  transport_mode?: 'sea' | 'road' | 'air' | 'rail' | null
  distance_km?: number | null
  transport_to_next?: string | null
}

export interface AnalysisSource {
  title: string
  uri: string
}

export interface AnalysisResult {
  lifecycle: LifecycleStep[]
  summary: string
  sources: AnalysisSource[]
}
