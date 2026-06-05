import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    type: { type: String, enum: ['community', 'structured'], required: true },
    title: { type: String, trim: true },
    category: { type: String, trim: true }, // e.g., 'Robotics', 'IoT', 'Electronics', 'Software', 'Other'
    description: { type: String, required: true }, // Brief summary for structured, main body for community
    problemStatement: { type: String, trim: true },
    solution: { type: String, trim: true },
    techStack: [{ type: String }],
    links: [{ type: String }],
    photos: [{ type: String }], // Cloudinary URLs
    files: [
      {
        name: { type: String },
        url: { type: String },
        publicId: { type: String }
      }
    ],
    upvotes: [{ type: String }], // Store string of User ID or Admin ID to easily check votes
    downvotes: [{ type: String }], // Store string of User ID or Admin ID
    commentsCount: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes for fast searching and filtering
ideaSchema.index({ type: 1, category: 1 });
ideaSchema.index({ userId: 1 });
ideaSchema.index({ adminId: 1 });

const Idea = mongoose.model('Idea', ideaSchema);
export default Idea;
