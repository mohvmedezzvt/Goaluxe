import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Reward Schema
 * Represents a reward that can be either public (predefined) or custom (created by a user).
 */
const rewardSchema = new Schema(
  {
    // Specifies the type of reward.
    type: {
      type: String,
      required: true,
      enum: [
        'points',
        'voucher',
        'badge',
        'discount',
        'experience',
        'physical_item',
      ],
    },
    // A numeric value representing the reward (e.g., 100 points, 20% discount).
    value: {
      type: Number,
      required: function () {
        return ['points', 'discount', 'experience'].includes(this.type);
      },
    },
    // Detailed description of the reward.
    description: {
      type: String,
      default: '',
    },
    // Optional expiry date for the reward.
    expiryDate: {
      type: Date,
      default: null,
    },
    // URL for redeeming the reward (for example, an online voucher page).
    redeemUrl: {
      type: String,
      default: '',
    },
    // URL to an image that represents the reward.
    imageUrl: {
      type: String,
      default: '',
    },
    // Category of the reward (e.g., "health", "entertainment").
    category: {
      type: String,
      default: '',
    },
    // Indicates whether this reward is public (predefined) or private (custom-created).
    public: {
      type: Boolean,
      default: true,
    },
    // For custom rewards, the user who created it. Public rewards will have this set to null.
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    delete ret.__v; // optionally remove the __v field
    return ret;
  },
});

export default mongoose.model('Reward', rewardSchema);
