'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { productsApi } from '@/lib/api/products.api';
import { ordersApi } from '@/lib/api/orders.api';

export default function POSInterface() {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

useEffect(() => {
    fetchMenuItems();
}, [selectedCategory, searchTerm]);

const fetchMenuItems = async () => {
try {
    const data = await productsApi.getAll({
        category: selectedCategory,
        search: searchTerm,
    });
    setMenuItems(data);
} catch (error) {
    console.error('Failed to fetch products:', error);
} finally {
    setLoading(false);
}};

const addToCart = (item) => {
    const itemId = item._id || item.id;
    const existingItem = cart.find(i => (i._id || i.id) === itemId);
    
    if (existingItem) {
    setCart(cart.map(i => 
        (i._id || i.id) === itemId
        ? { ...i, quantity: i.quantity + 1 }
        : i
    ));
} else {
    setCart([...cart, { ...item, quantity: 1 }]);
}};

const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
    const itemId = item._id || item.id;
    if (itemId === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
    }
    return item;
}).filter(item => item.quantity > 0));
};

const removeFromCart = (id) => {
    setCart(cart.filter(item => (item._id || item.id) !== id));
};

const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
};

const handleCheckout = async (paymentMethod) => {
    const { subtotal, tax, total } = calculateTotal();
    
    try {
    const orderData = {
        items: cart.map(item => ({
            productId: item._id || item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || item.image?.url,
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
    };

    await ordersApi.create(orderData);
    setCart([]);
    alert('Order completed successfully!');
    } catch (error) {
        console.error('Checkout failed:', error);
        alert('Failed to complete order: ' + (error.message || 'Unknown error'));
    }
};

const { subtotal, tax, total } = calculateTotal();

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen p-6">
      {/* Menu Section */}
        <div className="lg:col-span-2 overflow-y-auto">
            <div className="border-t pt-4">
            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
            </div>

            <div className="space-y-2">
                <button
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Cash Payment
                </button>
                <button
                onClick={() => handleCheckout('card')}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                <CreditCard size={20} />
                Card Payment
                </button>
                <button
                onClick={() => handleCheckout('qris')}
                disabled={cart.length === 0}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                QRIS Payment
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}