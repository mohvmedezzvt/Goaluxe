import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Goal Schema
 * Representing a single user-defined goal with a title, description, optional due date, custom reward,
 * and a flag indicating completion status. Timestamps are automatically added.
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
    // Indicates whether the goal has been completed (defaults to false)
    completed: {
      type: Boolean,
      default: false,
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

export default mongoose.model('Goal', goalSchema);
