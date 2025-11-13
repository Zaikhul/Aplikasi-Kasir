'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';

export default function SalesChart() {
const [reportType, setReportType] = useState('daily');
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
const [reportData, setReportData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
    fetchReport();
}, [reportType, selectedDate, selectedMonth]);

const fetchReport = async () => {
    setLoading(true);
    try {
    const endpoint = reportType === 'daily' ? 'daily' : 'monthly';
    const dateParam = reportType === 'daily' 
        ? `date=${selectedDate}` 
        : `month=${selectedMonth}`;

    const response = await fetch(`/api/reports/${endpoint}?${dateParam}`);
    const data = await response.json();
    setReportData(data);
    } catch (error) {
        console.error('Failed to fetch report:', error);
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
    return <div className="text-center py-12">Loading report...</div>;
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
        <div className="flex gap-4 mb-6">
        <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-lg ${
            reportType === 'daily' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            Daily Report
        </button>
        <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg ${
            reportType === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            Monthly Report
        </button>

        <div className="ml-auto flex items-center gap-2">
            <Calendar size={20} />
            {reportType === 'daily' ? (
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
            />
            ) : (
            <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg"
            />
            )}
        </div>
        </div>

        {reportData && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{reportData.totalOrders}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                Rp {reportData.totalRevenue.toLocaleString('id-ID')}
                </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold">
                Rp {reportData.totalTax.toLocaleString('id-ID')}
                </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                {reportType === 'monthly' ? 'Avg Order Value' : 'Total Discount'}
                </p>
                <p className="text-2xl font-bold">
                Rp {(reportType === 'monthly' 
                    ? reportData.averageOrderValue 
                    : reportData.totalDiscount
                ).toLocaleString('id-ID')}
                </p>
            </div>
            </div>

            {reportType === 'daily' && reportData.hourlyBreakdown && (
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
                    <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
                </ResponsiveContainer>
            </div>
            )}

            {reportType === 'monthly' && reportData.dailyRevenue && (
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Daily Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
                </ResponsiveContainer>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-semibold mb-4">Top Products</h3>
                <div className="space-y-2">
                {Object.entries(reportData.topProducts || reportData.topItems || {})
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .slice(0, 5)
                    .map(([name, data]) => (
                    <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">{name}</span>
                        <div className="text-right">
                        <p className="font-semibold">
                            Rp {data.revenue.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">{data.quantity} sold</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Payment Methods</h3>
                <div className="space-y-2">
                {Object.entries(reportData.paymentMethods || reportData.paymentMethodBreakdown || {})
                    .map(([method, value]) => (
                    <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium capitalize">{method}</span>
                        <span className="font-semibold">
                        {typeof value === 'number' && value < 1000 
                            ? `${value} orders`
                            : `Rp ${value.toLocaleString('id-ID')}`}
                        </span>
                    </div>
                    ))}
                </div>
            </div>
            </div>
        </>
        )}
    </div>
    </div>
);
}