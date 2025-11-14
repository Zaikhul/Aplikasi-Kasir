import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Package, 
    BarChart3, 
    Settings, 
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
const router = useRouter();
const { pathname } = router;
const [isMobileOpen, setIsMobileOpen] = useState(false);

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: ShoppingCart, label: 'POS', href: '/pos' },
    { icon: Package, label: 'Menu', href: '/menu' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
};

return (
    <>
    {/* Mobile Menu Button */}
    <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
    >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>

    {/* Overlay */}
    {isMobileOpen && (
        <div
        onClick={() => setIsMobileOpen(false)}
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        />
    )}

    {/* Sidebar */}
    <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
    >
        <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold">POS System</h1>
            <p className="text-sm text-gray-400 mt-1">Point of Sale</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
                <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                </a>
            );
            })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
            <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all"
            >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
            </button>
        </div>
        </div>
    </aside>
    </>
);
}