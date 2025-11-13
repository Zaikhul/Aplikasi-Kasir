import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
name: {
    type: String,
    required: [true, 'Name is required'],
},
email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
},
password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
},
role: {
    type: String,
    enum: ['admin', 'user', 'developer'],
    default: 'user',
},
subscription: {
    plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired'],
        default: 'inactive',
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
},
businessInfo: {
    businessName: String,
    address: String,
    phone: String,
    taxId: String,
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

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);