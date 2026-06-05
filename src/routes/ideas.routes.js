import express from 'express';
import {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  toggleVote,
  addComment,
  getComments,
  deleteComment,
  toggleHideIdea,
  toggleHideComment
} from '../controllers/ideas.controller.js';
import adminOrUserAuth from '../middleware/adminOrUserAuth.middleware.js';
import adminAuth from '../middleware/adminAuth.middleware.js';
import { uploadIdeaFile } from '../middleware/upload.middleware.js';

const router = express.Router();

// Upload middleware support for multipart form parsing (multiple files)
const parseIdeaUploads = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) return next();
  return uploadIdeaFile.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'files', maxCount: 3 }
  ])(req, res, next);
};

// CRUD Idea endpoints
router.post('/', adminOrUserAuth, parseIdeaUploads, createIdea);
router.post('/upload', adminOrUserAuth, uploadIdeaFile.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const resourceType = req.file.mimetype.startsWith('image/') ? 'auto' : 'raw';
    const result = await uploadToCloudinary(req.file.buffer, 'innovative-hub/uploads', resourceType);
    res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  } catch (error) {
    next(error);
  }
});
router.get('/', adminOrUserAuth, getIdeas); // Allow optional token to show hidden posts for admins
router.get('/:id', adminOrUserAuth, getIdeaById);
router.put('/:id', adminOrUserAuth, updateIdea);
router.delete('/:id', adminOrUserAuth, deleteIdea);

// Voting
router.post('/:id/vote', adminOrUserAuth, toggleVote);

// Comments
router.post('/:id/comments', adminOrUserAuth, addComment);
router.get('/:id/comments', adminOrUserAuth, getComments);
router.delete('/comments/:commentId', adminOrUserAuth, deleteComment);

// Admin Moderation (Hiding)
router.patch('/:id/hide', adminAuth, toggleHideIdea);
router.patch('/comments/:commentId/hide', adminAuth, toggleHideComment);

export default router;
