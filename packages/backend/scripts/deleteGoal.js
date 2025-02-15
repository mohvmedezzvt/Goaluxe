import 'dotenv/config.js';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import Goal from '../models/goalModel.js';

// Get the goal ID from the command line arguments
const goalId = process.argv[2];

if (!goalId) {
  console.error('Please provide a goal ID to delete.');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    const deletedGoal = await Goal.findByIdAndDelete(goalId);
    if (deletedGoal) {
      console.log('Goal deleted successfully:', deletedGoal);
    } else {
      console.log('No goal found with the given ID.');
    }
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error deleting goal:', error);
    mongoose.connection.close();
    process.exit(1);
  }
})();
