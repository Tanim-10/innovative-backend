import mongoose from 'mongoose';

const courseEnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  paymentId: { type: String, required: true },
  amountPaid: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Prevent duplicate enrollments
courseEnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

export default CourseEnrollment;
