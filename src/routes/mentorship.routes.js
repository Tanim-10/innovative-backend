import express from 'express';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequest
} from '../controllers/mentorship.controller.js';
import userAuth from '../middleware/userAuth.middleware.js';
import adminAuth from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Student routes (requires user authentication)
router.post('/', userAuth, createRequest);
router.get('/my-requests', userAuth, getMyRequests);

// Admin-only routes (requires admin authentication)
router.get('/', adminAuth, getAllRequests);
router.put('/:id', adminAuth, updateRequest);

export default router;
