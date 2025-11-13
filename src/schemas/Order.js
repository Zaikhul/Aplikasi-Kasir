import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
},
name: String,
price: Number,
quantity: {
    type: Number,
    required: true,
    min: 1,
},
subtotal: Number,
});

const OrderSchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
orderNumber: {
    type: String,
    unique: true,
    required: true,
},
items: [OrderItemSchema],
subtotal: {
    type: Number,
    required: true,
},
tax: {
    type: Number,
    default: 0,
},
discount: {
    type: Number,
    default: 0,
},
total: {
    type: Number,
    required: true,
},
paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'e-wallet', 'qris'],
    required: true,
},
paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
},
stripePaymentIntentId: String,
customerName: String,
customerPhone: String,
notes: String,
createdAt: {
    type: Date,
    default: Date.now,
},
completedAt: Date,
});

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);