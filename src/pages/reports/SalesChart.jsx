import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';

export default function SalesChart() {
const [reportType, setReportType] = useState('daily');
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
const [reportData, setReportData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
    fetchReport();
}, [reportType, selectedDate, selectedMonth]);

const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
    const endpoint = reportType === 'daily' ? 'daily' : 'monthly';
    const dateParam = reportType === 'daily' 
        ? `date=${selectedDate}` 
        : `month=${selectedMonth}`;

    const response = await fetch(`/api/reports/${endpoint}?${dateParam}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setReportData(data);
    } catch (err) {
        console.error('Failed to fetch report:', err);
        setError('Failed to load report data. Please try again.');
        setReportData(null);
    } finally {
        setLoading(false);
    }
};

const handleExport = async (format) => {
    const dateParam = reportType === 'daily' ? selectedDate : selectedMonth;
    const url = `/api/reports/export?type=${reportType}&date=${dateParam}&format=${format}`;
    
    window.open(url, '_blank');
};

if (loading) {
    return (
    <div className="flex items-center justify-center py-12">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading report data...</p>
        </div>
    </div>
    );
}

if (error || !reportData) {
    return (
    <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error</p>
        <p>{error || 'Unable to load report data. Please try again later.'}</p>
        </div>
    </div>
    );
}

return (
    <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <div className="flex gap-2">
        <button
            onClick={() => handleExport('xlsx')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
            <Download size={20} />
            Export Excel
        </button>
        <button
            onClick={() => handleExport('csv')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
            <Download size={20} />
            Export CSV
        </button>
        </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
        <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-lg ${
            reportType === 'daily' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
        >
            Daily Report
        </button>
        <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg ${
            reportType === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
        >
            Monthly Report
        </button>

        <div className="ml-auto flex items-center gap-2">
            <Calendar size={20} className="text-gray-600" />
            {reportType === 'daily' ? (
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            ) : (
            <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            )}
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{reportData.totalOrders || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">
            Rp {(reportData.totalRevenue || 0).toLocaleString('id-ID')}
            </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Tax</p>
            <p className="text-2xl font-bold">
            Rp {(reportData.totalTax || 0).toLocaleString('id-ID')}
            </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
            {reportType === 'monthly' ? 'Avg Order Value' : 'Total Discount'}
            </p>
            <p className="text-2xl font-bold">
            Rp {(reportType === 'monthly' 
                ? reportData.averageOrderValue || 0
                : reportData.totalDiscount || 0
            ).toLocaleString('id-ID')}
            </p>
        </div>
        </div>

        {reportType === 'daily' && reportData.hourlyBreakdown && Array.isArray(reportData.hourlyBreakdown) && reportData.hourlyBreakdown.length > 0 && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Hourly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.hourlyBreakdown.map((value, index) => ({
                hour: `${index}:00`,
                revenue: value,
            }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${(value || 0).toLocaleString('id-ID')}`} />
                <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        )}

        {reportType === 'monthly' && reportData.dailyRevenue && Array.isArray(reportData.dailyRevenue) && reportData.dailyRevenue.length > 0 && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Daily Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${(value || 0).toLocaleString('id-ID')}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
            </ResponsiveContainer>
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h3 className="text-xl font-semibold mb-4">Top Products</h3>
            {Object.entries(reportData.topProducts || reportData.topItems || {}).length > 0 ? (
            <div className="space-y-2">
            {Object.entries(reportData.topProducts || reportData.topItems || {})
                .sort((a, b) => (b[1].revenue || 0) - (a[1].revenue || 0))
                .slice(0, 5)
                .map(([name, data]) => (
                <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium truncate">{name}</span>
                    <div className="text-right">
                    <p className="font-semibold">
                        Rp {(data.revenue || 0).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-600">{data.quantity || 0} sold</p>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            <p className="text-gray-500 text-center py-6">No product data available</p>
            )}
        </div>

        <div>
            <h3 className="text-xl font-semibold mb-4">Payment Methods</h3>
            {Object.entries(reportData.paymentMethods || reportData.paymentMethodBreakdown || {}).length > 0 ? (
            <div className="space-y-2">
            {Object.entries(reportData.paymentMethods || reportData.paymentMethodBreakdown || {})
                .map(([method, value]) => (
                <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{method}</span>
                    <span className="font-semibold">
                    {typeof value === 'number' && value < 1000 
                        ? `${value} orders`
                        : `Rp ${(value || 0).toLocaleString('id-ID')}`}
                    </span>
                </div>
                ))}
            </div>
            ) : (
            <p className="text-gray-500 text-center py-6">No payment method data available</p>
            )}
        </div>
        </div>
    </div>
    </div>
);
}