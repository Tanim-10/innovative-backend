import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  attachmentUrl: { type: String }
});

const courseSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  topic: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  thumbnailUrl: { type: String },
  lectures: [lectureSchema],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;
