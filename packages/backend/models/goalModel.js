import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Goal Schema
 * Representing a single user-defined goal with a title, description, optional due date, custom reward,
 * and a status indicating completion status. Timestamps are automatically added.
 */
const goalSchema = new Schema(
  {
    // The name or title of the goal (required)
    title: {
      type: String,
      required: true,
    },
    // A detailed explanation of the goal (optional)
    description: {
      type: String,
      default: '',
    },
    // The target date by which the goal should be achieved (optional)
    dueDate: {
      type: Date,
      default: null,
    },
    // The custom reward associated with the goal (optional)
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      default: null,
    },
    // The progress towards achieving the goal (defaults to 0)
    progress: {
      type: Number,
      default: 0,
    },
    // Indicates the status of the goal (defaults to 'active')
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    // The ID of the user who owns this goal.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Automatically remove the `user` field when converting to JSON
goalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id; // add a new 'id' field with the value of _id
    delete ret._id; // Remove the _id field
    delete ret.__v; // Remove the __v field
    delete ret.user; // Remove the user field
    return ret;
  },
});

export default mongoose.model('Goal', goalSchema);
