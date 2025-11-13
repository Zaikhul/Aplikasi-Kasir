import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
name: {
    type: String,
    required: [true, 'Menu name is required'],
},
description: {
    type: String,
    default: '',
},
price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
},
category: {
    type: String,
    required: [true, 'Category is required'],
},
image: {
    url: String,
    publicId: String,
},
stock: {
    type: Number,
    default: 0,
},
isAvailable: {
    type: Boolean,
    default: true,
},
sku: {
    type: String,
    unique: true,
    sparse: true,
},
createdAt: {
    type: Date,
    default: Date.now,
},
updatedAt: {
    type: Date,
    default: Date.now,
},
});

MenuSchema.index({ userId: 1, category: 1 });
MenuSchema.index({ userId: 1, name: 'text', description: 'text' });

export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);