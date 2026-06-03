import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meetingLink: { type: String, default: '' },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);

export default MentorshipRequest;
