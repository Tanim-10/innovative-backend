import express from 'express';
import {
  createWorkshop,
  getApprovedWorkshops,
  enrollInWorkshop,
  getEnrolledWorkshops,
  getMyHostedWorkshops
} from '../controllers/workshop.controller.js';
import userAuth from '../middleware/userAuth.middleware.js';

const router = express.Router();

router.post('/', userAuth, createWorkshop);
router.get('/', getApprovedWorkshops);
router.get('/enrolled', userAuth, getEnrolledWorkshops);
router.get('/hosted', userAuth, getMyHostedWorkshops);
router.post('/:id/enroll', userAuth, enrollInWorkshop);

export default router;
