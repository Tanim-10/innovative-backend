import express from 'express';
import {
  createCourse,
  getCourses,
  getTutorCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseViewer,
  purchaseCourse,
  verifyCoursePurchase,
  getEnrolledCourses
} from '../controllers/course.controller.js';
import userAuth from '../middleware/userAuth.middleware.js';

const router = express.Router();

router.post('/', userAuth, createCourse);
router.get('/', getCourses);
router.get('/tutor', userAuth, getTutorCourses);
router.get('/enrolled', userAuth, getEnrolledCourses);
router.get('/:id', getCourseById);
router.put('/:id', userAuth, updateCourse);
router.delete('/:id', userAuth, deleteCourse);
router.get('/:id/viewer', userAuth, getCourseViewer);
router.post('/:id/purchase', userAuth, purchaseCourse);
router.post('/:id/verify-purchase', userAuth, verifyCoursePurchase);

export default router;
