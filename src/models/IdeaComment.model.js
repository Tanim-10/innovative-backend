import mongoose from 'mongoose';

const ideaCommentSchema = new mongoose.Schema(
  {
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    comment: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ideaCommentSchema.index({ ideaId: 1 });
ideaCommentSchema.index({ userId: 1 });
ideaCommentSchema.index({ adminId: 1 });

const IdeaComment = mongoose.model('IdeaComment', ideaCommentSchema);
export default IdeaComment;
