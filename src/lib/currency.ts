/**
 * Formats a number as Indonesian Rupiah (IDR) currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "Rp 10.000" or "Rp 1.500.000")
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'Rp 0'
  }

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value)
  } catch {
    // Fallback formatting
    return `Rp ${value.toLocaleString('id-ID')}`
  }
}

/**
 * Formats a number as Indonesian Rupiah (IDR) without the currency symbol prefix
 * Useful for cases where you want to display "Rp" separately
 * @param value - The numeric value to format
 * @returns Formatted number string (e.g., "10.000" or "1.500.000")
 */
export function formatCurrencyValue(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '0'
  }

  try {
    return value.toLocaleString('id-ID')
  } catch {
    return String(value)
  }
}

