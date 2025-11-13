import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import connectDB from '@/lib/mongodb';
import Order from '@/schemas/Order';
import * as XLSX from 'xlsx';

export async function GET(request) {
try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'daily' or 'monthly'
    const date = searchParams.get('date');
    const format = searchParams.get('format') || 'xlsx'; // 'xlsx' or 'csv'

    await connectDB();

    let startDate, endDate;

    if (type === 'daily') {
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
    } else {
        const [year, month] = date.split('-').map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
    }

    const orders = await Order.find({
        userId: session.user.id,
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'completed',
    }).lean();

    // Prepare data for export
    const exportData = orders.map(order => ({
        'Order Number': order.orderNumber,
        'Date': new Date(order.createdAt).toLocaleString('id-ID'),
        'Customer': order.customerName || '-',
        'Items': order.items.map(i => `${i.name} (${i.quantity}x)`).join(', '),
        'Subtotal': order.subtotal,
        'Tax': order.tax,
        'Discount': order.discount,
        'Total': order.total,
        'Payment Method': order.paymentMethod,
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: format === 'csv' ? 'csv' : 'xlsx' });

    // Set headers
    const headers = new Headers();
    headers.set('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="sales-report-${date}.${format}"`);

    return new NextResponse(buffer, { status: 200, headers });
} catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
        { error: 'Failed to export report' },
        { status: 500 }
    );
}}