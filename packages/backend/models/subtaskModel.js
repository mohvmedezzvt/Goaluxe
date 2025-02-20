import mongoose from 'mongoose';

const { Schema } = mongoose;

const subtaskSchema = new Schema(
  {
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
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

export default mongoose.model('Subtask', subtaskSchema);
