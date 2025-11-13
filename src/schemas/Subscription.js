import mongoose from 'mongoose';

const SubscriptionPlanSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'premium', 'enterprise'],
},
price: {
    type: Number,
    required: true,
},
interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month',
},
features: {
    maxMenuItems: Number,
    maxOrders: Number,
    multiUser: Boolean,
    advancedReports: Boolean,
    apiAccess: Boolean,
    Support: Boolean,
    // priority Support: Boolean,
},
stripePriceId: String,
active: {
    type: Boolean,
    default: true,
},
});

export default mongoose.models.SubscriptionPlan || 
    mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);