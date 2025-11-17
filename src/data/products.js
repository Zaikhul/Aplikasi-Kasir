export type ProductCategory = 'Mains' | 'Desserts' | 'Drinks' | 'Appetizers'

export interface IProductModel {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  inventory: number
  sku: string
  imageUrl: string
  detailedImages: string[]
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  rating: number
}

export const ALL_PRODUCTS: IProductModel[] = [
  {
    id: '1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon grilled to perfection with herbs and lemon',
    price: 24.99,
    category: 'Mains',
    inventory: 15,
    sku: 'FDSALM001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/d17c60f9-a97a-4410-987a-04d0faf1609f.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing, parmesan, and croutons',
    price: 12.99,
    category: 'Appetizers',
    inventory: 25,
    sku: 'FDCSAL001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/5be35a44-2a0a-4d87-b636-b79fafdacb5f.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, tomato sauce, and basil',
    price: 16.99,
    category: 'Mains',
    inventory: 20,
    sku: 'FDPIZZ001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/8e586eac-eac3-4fba-9358-94134b459e94.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    price: 14.99,
    category: 'Mains',
    inventory: 18,
    sku: 'FDBRGR001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/62fb09c5-1496-47f8-98dc-e361f86883b1.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Pad Thai',
    description: 'Traditional Thai stir-fried noodles with shrimp, tofu, and peanuts',
    price: 13.99,
    category: 'Mains',
    inventory: 12,
    sku: 'FDPTHA001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/1f61141e-3bec-433d-aff6-a12d1862c2c1.png',
    detailedImages: [],
    status: 'Low Stock',
    rating: 4.6,
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    description: 'Rich chocolate layer cake with buttercream frosting',
    price: 8.99,
    category: 'Desserts',
    inventory: 30,
    sku: 'FDCKCH001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/99f6515e-71c3-4f0c-984d-849d50d97eeb.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.9,
  },
  {
    id: '7',
    name: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
    price: 15.99,
    category: 'Mains',
    inventory: 16,
    sku: 'FDSPAG001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/87d5317a-6e00-47b2-b28f-464af32295e5.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.7,
  },
  {
    id: '8',
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken in creamy tomato curry sauce',
    price: 17.99,
    category: 'Mains',
    inventory: 14,
    sku: 'FDCHIK001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/6f6a643c-4d3b-460e-9029-7197db47e3c9.png',
    detailedImages: [],
    status: 'Low Stock',
    rating: 4.8,
  },
  {
    id: '9',
    name: 'Iced Coffee',
    description: 'Cold brew coffee served over ice',
    price: 4.99,
    category: 'Drinks',
    inventory: 50,
    sku: 'FDCOFF001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/d17c60f9-a97a-4410-987a-04d0faf1609f.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.4,
  },
  {
    id: '10',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 5.99,
    category: 'Drinks',
    inventory: 40,
    sku: 'FDORNG001',
    imageUrl: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/5be35a44-2a0a-4d87-b636-b79fafdacb5f.png',
    detailedImages: [],
    status: 'In Stock',
    rating: 4.5,
  },
]

export const PRODUCT_GRID_SUMMARIES = ALL_PRODUCTS

export function getProductById(id: string): IProductModel | undefined {
  return ALL_PRODUCTS.find(product => product.id === id)
}

