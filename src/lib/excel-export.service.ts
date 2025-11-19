import * as XLSX from 'xlsx'
import { formatCurrency } from './currency'

interface DetailedReportData {
  orders: any[]
  totalOrders: number
  totalRevenue: number
  revenueByCategory: Record<string, number>
  productSales: Array<{
    productId: string
    productName: string
    category: string
    totalQuantitySold: number
    totalRevenue: number
    averagePrice: number
  }>
  dailySales: Array<{ date: string; sales: number; orders: number }>
  paymentMethodSummary: Record<string, { count: number; revenue: number }>
}

export interface DateRange {
  startDate: string
  endDate: string
  label: string
}

/**
 * Calculate date ranges for different periods
 */
export function getDateRange(period: 'weekly' | 'monthly' | 'semesterly' | 'yearly', customStart?: Date, customEnd?: Date): DateRange {
  const now = customEnd || new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  let startDate: Date
  let endDate: Date = new Date(today)
  endDate.setHours(23, 59, 59, 999)

  if (customStart && customEnd) {
    startDate = new Date(customStart)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(customEnd)
    endDate.setHours(23, 59, 59, 999)
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    }
  }

  switch (period) {
    case 'weekly': {
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 6) // Last 7 days
      startDate.setHours(0, 0, 0, 0)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: 'Last 7 Days',
      }
    }
    case 'monthly': {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      startDate.setHours(0, 0, 0, 0)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: `${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      }
    }
    case 'semesterly': {
      const month = today.getMonth()
      const startMonth = month < 6 ? 0 : 6 // First semester (Jan-Jun) or Second semester (Jul-Dec)
      startDate = new Date(today.getFullYear(), startMonth, 1)
      startDate.setHours(0, 0, 0, 0)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: `Semester ${startMonth === 0 ? '1' : '2'} ${today.getFullYear()}`,
      }
    }
    case 'yearly': {
      startDate = new Date(today.getFullYear(), 0, 1)
      startDate.setHours(0, 0, 0, 0)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: `Year ${today.getFullYear()}`,
      }
    }
    default:
      throw new Error(`Invalid period: ${period}`)
  }
}

/**
 * Format number for Excel (removes currency formatting)
 */
function formatNumber(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Export detailed sales report to Excel
 */
export async function exportSalesReportToExcel(
  data: DetailedReportData,
  periodLabel: string,
  dateRange: DateRange,
): Promise<void> {
  const workbook = XLSX.utils.book_new()

  // Helper to add a worksheet
  const addWorksheet = (name: string, data: any[][], columns?: string[]) => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    
    // Auto-size columns
    const colWidths: number[] = []
    if (data.length > 0) {
      data[0].forEach((_: any, colIndex: number) => {
        let maxLength = columns ? columns[colIndex].length : 10
        data.forEach((row: any[]) => {
          const cellValue = row[colIndex]
          if (cellValue !== null && cellValue !== undefined) {
            const cellLength = String(cellValue).length
            maxLength = Math.max(maxLength, cellLength)
          }
        })
        colWidths.push(Math.min(maxLength + 2, 50))
      })
    }
    ws['!cols'] = colWidths.map((w) => ({ wch: w }))
    
    XLSX.utils.book_append_sheet(workbook, ws, name)
  }

  // Summary Sheet
  const summaryData: any[] = [
    ['SALES REPORT SUMMARY'],
    [''],
    ['Period', periodLabel],
    ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
    ['Generated Date', new Date().toLocaleString('id-ID')],
    [''],
    ['TOTAL ORDERS', data.totalOrders],
    ['TOTAL REVENUE', formatNumber(data.totalRevenue)],
    ['AVERAGE ORDER VALUE', formatNumber(data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0)],
    [''],
    ['PAYMENT METHOD SUMMARY'],
  ]

  // Payment method summary
  Object.entries(data.paymentMethodSummary).forEach(([method, summary]) => {
    summaryData.push([
      method.toUpperCase(),
      `Orders: ${summary.count}`,
      `Revenue: ${formatNumber(summary.revenue)}`,
    ])
  })

  summaryData.push([''])
  summaryData.push(['REVENUE BY CATEGORY'])
  Object.entries(data.revenueByCategory).forEach(([category, revenue]) => {
    summaryData.push([category, formatNumber(revenue)])
  })

  addWorksheet('Summary', summaryData)

  // Product Sales Sheet
  const productSalesData: any[] = [
    ['PRODUCT SALES REPORT'],
    [''],
    ['Product Name', 'Category', 'Quantity Sold', 'Total Revenue', 'Average Price'],
  ]
  data.productSales.forEach((product) => {
    productSalesData.push([
      product.productName,
      product.category,
      product.totalQuantitySold,
      formatNumber(product.totalRevenue),
      formatNumber(product.averagePrice),
    ])
  })
  addWorksheet('Product Sales', productSalesData)

  // Revenue by Category Sheet
  const categoryRevenueData: any[] = [
    ['REVENUE BY CATEGORY'],
    [''],
    ['Category', 'Total Revenue', 'Percentage'],
  ]
  const totalRevenue = data.totalRevenue
  Object.entries(data.revenueByCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, revenue]) => {
      const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      categoryRevenueData.push([
        category,
        formatNumber(revenue),
        `${formatNumber(percentage)}%`,
      ])
    })
  addWorksheet('Revenue by Category', categoryRevenueData)

  // Daily Sales Sheet
  const dailySalesData: any[] = [
    ['DAILY SALES REPORT'],
    [''],
    ['Date', 'Total Revenue', 'Number of Orders', 'Average Order Value'],
  ]
  data.dailySales.forEach((day) => {
    const avgOrderValue = day.orders > 0 ? day.sales / day.orders : 0
    dailySalesData.push([
      new Date(day.date).toLocaleDateString('id-ID'),
      formatNumber(day.sales),
      day.orders,
      formatNumber(avgOrderValue),
    ])
  })
  addWorksheet('Daily Sales', dailySalesData)

  // Orders Detail Sheet
  const ordersData: any[] = [
    ['ORDERS DETAIL REPORT'],
    [''],
    [
      'Order Number',
      'Date',
      'Payment Method',
      'Items Count',
      'Subtotal',
      // # Tax column deactivated
      // 'Tax',
      'Total',
    ],
  ]
  data.orders.forEach((order) => {
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('id-ID')
      : 'N/A'
    const itemsCount = order.items ? order.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0
    ordersData.push([
      order.orderNumber || order._id?.slice(-8) || 'N/A',
      orderDate,
      order.paymentMethod || 'N/A',
      itemsCount,
      formatNumber(order.subtotal || 0),
      // # Tax value deactivated
      // formatNumber(order.tax || 0),
      0, // Tax disabled
      formatNumber(order.total || 0),
    ])
  })
  addWorksheet('Orders Detail', ordersData)

  // Order Items Detail Sheet (Expanded view of all items sold)
  const orderItemsData: any[] = [
    ['ORDER ITEMS DETAIL REPORT'],
    [''],
    ['Order Number', 'Date', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Subtotal', 'Payment Method'],
  ]
  data.orders.forEach((order) => {
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('id-ID')
      : 'N/A'
    const orderNumber = order.orderNumber || order._id?.slice(-8) || 'N/A'
    const paymentMethod = order.paymentMethod || 'N/A'

    // Get product categories from product sales map
    const productCategoryMap = new Map<string, string>()
    data.productSales.forEach((product) => {
      productCategoryMap.set(product.productId, product.category)
    })

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        const productId = item.productId?.toString() || 'unknown'
        const category = productCategoryMap.get(productId) || 'Unknown'
        orderItemsData.push([
          orderNumber,
          orderDate,
          item.productName || 'Unknown Product',
          category,
          item.quantity || 0,
          formatNumber(item.price || 0),
          formatNumber((item.price || 0) * (item.quantity || 0)),
          paymentMethod,
        ])
      })
    } else {
      orderItemsData.push([orderNumber, orderDate, 'No items', 'N/A', 0, 0, 0, paymentMethod])
    }
  })
  addWorksheet('Order Items Detail', orderItemsData)

  // Generate filename
  const filename = `Sales_Report_${periodLabel.replace(/\s+/g, '_')}_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`

  // Write file
  XLSX.writeFile(workbook, filename)
}

