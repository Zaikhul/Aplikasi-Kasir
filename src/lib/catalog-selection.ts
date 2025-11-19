export type CatalogSelectionItem = {
  productId: string
  name: string
  price: number
  imageUrl?: string
  category?: string
  quantity: number
}

const STORAGE_KEY = 'catalog-selection'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadCatalogSelection(): CatalogSelectionItem[] {
  if (!isBrowser()) {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return []
    }
    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item) => typeof item?.productId === 'string')
  } catch (error) {
    console.warn('Failed to load catalog selection from storage:', error)
    return []
  }
}

export function saveCatalogSelection(items: CatalogSelectionItem[]): void {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('Failed to save catalog selection to storage:', error)
  }
}

export function clearCatalogSelection(): void {
  if (!isBrowser()) {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export function calculateCatalogTotals(items: CatalogSelectionItem[]): {
  totalQuantity: number
  subtotal: number
} {
  return items.reduce(
    (acc, item) => {
      acc.totalQuantity += item.quantity
      acc.subtotal += item.price * item.quantity
      return acc
    },
    { totalQuantity: 0, subtotal: 0 },
  )
}

