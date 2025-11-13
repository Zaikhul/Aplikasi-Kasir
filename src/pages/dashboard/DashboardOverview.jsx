import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Users, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    topProducts: [],
    recentOrders: [],
    chartData: [],
});
const [loading, setLoading] = useState(true);

useEffect(() => {
    fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const month = new Date().toISOString().slice(0, 7);

        const [dailyReport, monthlyReport] = await Promise.all([
            fetch(`/api/reports/daily?date=${today}`).then(r => r.json()),
            fetch(`/api/reports/monthly?month=${month}`).then(r => r.json()),
        ]);

    setStats({
        todayOrders: dailyReport.totalOrders || 0,
        todayRevenue: dailyReport.totalRevenue || 0,
        monthlyOrders: monthlyReport.totalOrders || 0,
        monthlyRevenue: monthlyReport.totalRevenue || 0,
        topProducts: Object.entries(monthlyReport.topProducts || {})
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5),
        chartData: monthlyReport.dailyRevenue || [],
    });
} catch (error) {
    console.error('Failed to fetch dashboard data:', error);
} finally {
    setLoading(false);
}};

if (loading) {
    return (
    <div className="flex items-center justify-center h-96">
    <div className="text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p className="text-gray-600">Loading dashboard data...</p>
    </div>
    </div>
    );
}

const statCards = [
    {
    title: "Today's Orders",
    value: stats.todayOrders,
    icon: ShoppingCart,
    color: 'blue',
    change: '+12%',
    trend: 'up',
    },
    {
    title: "Today's Revenue",
    value: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(stats.todayRevenue),
    icon: DollarSign,
    color: 'green',
    change: '+8%',
    trend: 'up',
    },
{
    title: 'Monthly Orders',
    value: stats.monthlyOrders,
    icon: Package,
    color: 'purple',
    change: '+23%',
    trend: 'up',
    },
    {
    title: 'Monthly Revenue',
    value: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(stats.monthlyRevenue),
    icon: TrendingUp,
    color: 'orange',
    change: '+15%',
    trend: 'up',
    },
];

const renderStatValue = (stat) => {
    if (typeof stat.value === 'string') {
        return stat.value;
    }
    return stat.value?.toString() || '0';
};

const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
};

return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto space-y-6">
        <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
            <div
                key={`stat-${stat.title}`}
                className={`bg-linear-to-br ${colorClasses[stat.color]} rounded-lg shadow-lg p-6 text-white relative overflow-hidden`}
            >
                <div className="absolute top-0 right-0 opacity-10">
                <Icon size={120} />
                </div>
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <Icon size={24} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-white' : 'text-red-200'
                    }`}>
                    {stat.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {stat.change}
                    </div>
                </div>
                <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                <p className="text-2xl md:text-3xl font-bold truncate">{renderStatValue(stat)}</p>
                </div>
            </div>
            );
        })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                formatter={(value) => new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Products</h3>
                {stats.topProducts && stats.topProducts.length > 0 ? (
            <div className="space-y-3">
            {stats.topProducts.map((product, idx) => (
                <div key={`product-${product.name}-${idx}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} sold</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(product.revenue)}
                    </p>
                </div>
                </div>
            ))}
            </div>
                        ) : (
                        <p className="text-gray-500 text-center py-8">No top products data available</p>
                        )}
        </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
            href="/pos"
            className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all"
            >
            <ShoppingCart size={32} className="text-blue-600" />
            <span className="font-semibold text-gray-800">New Order</span>
            </a>
            <a
            href="/menu"
            className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all"
            >
            <Package size={32} className="text-green-600" />
            <span className="font-semibold text-gray-800">Manage Menu</span>
            </a>
            <a
            href="/reports"
            className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all"
            >
            <TrendingUp size={32} className="text-purple-600" />
            <span className="font-semibold text-gray-800">View Reports</span>
            </a>
            <a
            href="/settings"
            className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all"
            >
            <Users size={32} className="text-orange-600" />
            <span className="font-semibold text-gray-800">Settings</span>
            </a>
        </div>
        </div>
    </div>
    </div>
);
}