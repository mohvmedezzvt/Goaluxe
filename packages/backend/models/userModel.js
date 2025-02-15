import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * User Schema
 * Defines the structure for user documents in the database;
 */
const userSchema = new Schema(
  {
    // Username: must be a unique, required string.
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    // Email: required, unique, and validated with a regex.
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    // Password: required string to store the hashed password.
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    // Role (optional): for role-based access control; defaults to "user".
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    // Enable automatic createdAt and updatedAt timestamps.
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id; // add a new 'id' field with the value of '_id'
    delete ret._id; // remove the '_id' field
    delete ret.__v; // optionally remove the __v field
    return ret;
  },
});

export default mongoose.model('User', userSchema);
