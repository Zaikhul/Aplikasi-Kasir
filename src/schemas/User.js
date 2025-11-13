import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegex = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            maxlength: [100, 'Name must be at most 100 characters'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [emailRegex, 'Please provide a valid email address'],
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
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
            businessName: { type: String, trim: true },
            address: { type: String, trim: true },
            phone: { type: String, trim: true },
            taxId: { type: String, trim: true },
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 12);
        }
        return next();
    } catch (err) {
        return next(err);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);