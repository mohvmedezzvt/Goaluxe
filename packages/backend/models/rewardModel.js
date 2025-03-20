import mongoose from 'mongoose';
const { Schema } = mongoose;

const rewardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      required: true,
    },
    iconColor: {
      type: String,
      default: '#000000',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goals: [{
      type: Schema.Types.ObjectId,
      ref: 'Goal',
    }],
    status: {
      type: String,
      enum: ['available', 'claimed'],
      default: 'available',
    },
    type: {
      type: String,
      enum: ['personal', 'purchase', 'activity'],
      default: 'personal',
    },
    // Settings and preferences
    autoClaimEnabled: {
      type: Boolean,
      default: false,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    // Timestamp for when the reward was claimed
    claimedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id; // add a new 'id' field with the value of '_id'
    delete ret._id; // remove the '_id' field
    delete ret.__v; // remove the __v field
    return ret;
  },
});

// Indexes for performance
rewardSchema.index({ user: 1 });
rewardSchema.index({ status: 1 });
rewardSchema.index({ 'goals': 1 });

export default mongoose.model('Reward', rewardSchema);
