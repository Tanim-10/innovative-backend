import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  skills: [{ type: String }],
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String, required: true },
  portfolioUrl: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'under-review', 'shortlisted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

const Internship = mongoose.model('Internship', internshipSchema);

export default Internship;
