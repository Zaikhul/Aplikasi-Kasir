import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import MenuForm from '@/pages/menu/MenuForm';
import { apiClient } from '@/lib/apiClient';

export default function MenuList() {
    const [menuItems, setMenuItems] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    fetchMenuItems();
}, []);

const fetchMenuItems = async () => {
try {
    const response = await apiClient('/menu');
    const data = await response.json();
    setMenuItems(data);
    } catch (error) {
        console.error('Failed to fetch menu:', error);
    } finally {
        setLoading(false);
    }
};

const handleDelete = async (id) => {
if (!confirm('Are you sure you want to delete this item?')) return;

try {
    const response = await apiClient(`/menu/${id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        setMenuItems(menuItems.filter(item => item._id !== id));
    }
    } catch (error) {
        console.error('Failed to delete:', error);
    }
};

const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
};

const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    fetchMenuItems();
};

return (
    <div className="p-6">
    <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button
        onClick={() => setIsFormOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
        <Plus size={20} />
        Add Menu Item
        </button>
    </div>

    {loading ? (
        <div className="text-center py-12">Loading...</div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {item.image?.url && (
                <img
                src={item.image.url}
                alt={item.name}
                className="w-full h-48 object-cover"
                />
            )}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                    item.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                </div>
                <p className="text-gray-700 mb-3">{item.description}</p>
                <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                    Rp {item.price.toLocaleString('id-ID')}
                </span>
                <div className="flex gap-2">
                    <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                    <Edit2 size={18} />
                    </button>
                    <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                    <Trash2 size={18} />
                    </button>
                </div>
                </div>
                {item.stock !== undefined && (
                <p className="text-sm text-gray-600 mt-2">
                    Stock: {item.stock} units
                </p>
                )}
            </div>
            </div>
        ))}
        </div>
    )}

    {isFormOpen && (
        <MenuForm
        item={editingItem}
        onClose={handleFormClose}
        />
    )}
    </div>
);
}