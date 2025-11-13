/* eslint-disable react/prop-types */
import { useState } from 'react';
import { X } from 'lucide-react';

function MenuForm({ item, onClose }) {
const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category: item?.category || 'food',
    stock: item?.stock || 0,
    isAvailable: item?.isAvailable ?? true,
    sku: item?.sku || '',
});
const [imageFile, setImageFile] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

try {
    let imageData = item?.image;

    // Upload image if new file selected
    if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formDataImage,
        });

        if (uploadResponse.ok) {
        imageData = await uploadResponse.json();
        } else {
        const uploadError = await uploadResponse.json();
        setError(uploadError.error || 'Failed to upload image');
        setLoading(false);
        return;
        }
    }

    const url = item ? `/api/menu/${item._id}` : '/api/menu';
    const method = item ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock, 10),
        image: imageData,
        }),
    });

    if (response.ok) {
        onClose();
    } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save menu item');
    }
    } catch (err) {
        console.error('Failed to save menu item:', err);
        setError('An error occurred. Please try again.');
    } finally {
        setLoading(false);
    }
};

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
    }));
};

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>
        <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
        >
            <X size={24} />
        </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
            </div>
            )}
        <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
            <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">Price (Rp) *</label>
            <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="100"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category *</label>
            <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
                <option value="food">Food</option>
                <option value="drinks">Drinks</option>
                <option value="snacks">Snacks</option>
                <option value="desserts">Desserts</option>
            </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-1">Stock</label>
            <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</label>
            <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            </div>
        </div>

        <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">Image</label>
            <div className="border-2 border-dashed rounded-lg p-4">
            {item?.image?.url && !imageFile && (
                <img
                src={item.image.url}
                alt="Current"
                className="w-32 h-32 object-cover rounded mb-2"
                />
            )}
            <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full"
            />
            </div>
        </div>

        <div className="flex items-center gap-2">
            <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="w-4 h-4"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium">Available for sale</label>
        </div>

        <div className="flex gap-3 pt-4">
            <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
            {loading ? 'Saving...' : 'Save'}
            </button>
            <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
            Cancel
            </button>
        </div>
        </form>
    </div>
    </div>
);
}