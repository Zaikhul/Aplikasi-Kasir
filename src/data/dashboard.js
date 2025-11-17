export interface IChartDataModel {
  title: string
  labels: string[]
  series: Array<{
    name: string
    data: number[]
  }>
}

export const DASHBOARD_STATS = [
  {
    title: 'Total Revenue',
    value: 45231,
    unit: '$',
    iconName: 'DollarSign',
    trend: 12.5,
  },
  {
    title: 'Total Orders',
    value: 1234,
    unit: '',
    iconName: 'ShoppingCart',
    trend: 8.2,
  },
  {
    title: 'Active Products',
    value: 156,
    unit: '',
    iconName: 'Package',
    trend: 5.3,
  },
  {
    title: 'Customers',
    value: 892,
    unit: '',
    iconName: 'Users',
    trend: -3.1,
  },
]

export const SALES_OVERVIEW_CHART: IChartDataModel = {
  title: 'Sales Overview',
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  series: [
    {
      name: 'Revenue',
      data: [45, 52, 48, 61, 55, 67, 72],
    },
    {
      name: 'Cost',
      data: [28, 32, 30, 38, 35, 42, 45],
    },
  ],
}

export const PRODUCT_CATEGORY_DISTRIBUTION_CHART: IChartDataModel = {
  title: 'Product Category Distribution',
  labels: ['Mains', 'Desserts', 'Drinks', 'Appetizers'],
  series: [
    {
      name: 'Products',
      data: [45, 20, 15, 12],
    },
  ],
}

