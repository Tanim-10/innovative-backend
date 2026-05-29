import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import Course from '../models/Course.model.js';
import CourseEnrollment from '../models/CourseEnrollment.model.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: check if tutor is approved
const checkTutorApproval = (req, res) => {
  if (req.user.role !== 'tutor' || req.user.tutorStatus !== 'approved') {
    res.status(403).json({ success: false, message: 'Access denied. Tutors must be approved.' });
    return false;
  }
  return true;
};

export const createCourse = async (req, res, next) => {
  try {
    if (!checkTutorApproval(req, res)) return;

    const { title, description, difficulty, topic, price, thumbnailUrl, lectures } = req.body;
    if (!title || !description || !topic) {
      return res.status(400).json({ success: false, message: 'Title, description, and topic are required' });
    }

    const course = await Course.create({
      tutorId: req.userId,
      title,
      description,
      difficulty: difficulty || 'beginner',
      topic,
      price: price || 0,
      thumbnailUrl,
      lectures: lectures || [],
      isPublished: false
    });

    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const { search, difficulty, topic } = req.query;
    const filter = { isPublished: true };

    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Populate tutor name and image
    const courses = await Course.find(filter)
      .populate('tutorId', 'name profileImage')
      .select('-lectures.videoUrl -lectures.attachmentUrl'); // Hide secure fields from catalog

    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getTutorCourses = async (req, res, next) => {
  try {
    if (!checkTutorApproval(req, res)) return;

    const courses = await Course.find({ tutorId: req.userId });
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('tutorId', 'name profileImage bio expertise');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // If student is logged in, check if they are enrolled
    let isEnrolled = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const enrollment = await CourseEnrollment.findOne({ studentId: decoded.id, courseId: course._id });
        if (enrollment) isEnrolled = true;
      } catch (err) {
        // Token invalid, keep isEnrolled = false
      }
    }

    // Hide video URLs and attachment URLs if not the tutor or enrolled student
    const isOwner = req.userId && course.tutorId._id.toString() === req.userId.toString();
    const shouldHideLecturesDetails = !isOwner && !isEnrolled;

    const courseObj = course.toObject();
    if (shouldHideLecturesDetails) {
      courseObj.lectures = courseObj.lectures.map(lecture => ({
        _id: lecture._id,
        title: lecture.title,
        description: lecture.description,
        videoUrl: '', // Hide it
        attachmentUrl: '' // Hide it
      }));
    }

    res.json({ success: true, data: { ...courseObj, isEnrolled } });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    if (!checkTutorApproval(req, res)) return;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.tutorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    const { title, description, difficulty, topic, price, thumbnailUrl, lectures, isPublished } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (difficulty) course.difficulty = difficulty;
    if (topic) course.topic = topic;
    if (price !== undefined) course.price = price;
    if (thumbnailUrl !== undefined) course.thumbnailUrl = thumbnailUrl;
    if (lectures) course.lectures = lectures;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();
    res.json({ success: true, message: 'Course updated successfully', data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    if (!checkTutorApproval(req, res)) return;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.tutorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await Course.deleteOne({ _id: course._id });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCourseViewer = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('tutorId', 'name profileImage');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Owner (tutor) can view, or enrolled student
    const isOwner = course.tutorId._id.toString() === req.userId.toString();
    const enrollment = await CourseEnrollment.findOne({ studentId: req.userId, courseId: course._id });

    if (!isOwner && !enrollment) {
      return res.status(403).json({ success: false, message: 'Please purchase this course to access the classroom' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const purchaseCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const existing = await CourseEnrollment.findOne({ studentId: req.userId, courseId: course._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    // If free, enroll immediately
    if (course.price === 0) {
      const enrollment = await CourseEnrollment.create({
        studentId: req.userId,
        courseId: course._id,
        paymentId: 'free',
        amountPaid: 0
      });
      return res.json({ success: true, enrolled: true, data: enrollment });
    }

    // Otherwise, create Razorpay Order
    const order = await razorpay.orders.create({
      amount: Math.round(course.price * 100),
      currency: 'INR',
      receipt: `course_${course._id}_${Date.now()}`,
    });

    res.json({
      success: true,
      enrolled: false,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        coursePrice: course.price
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCoursePurchase = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment payload' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await CourseEnrollment.create({
      studentId: req.userId,
      courseId: course._id,
      paymentId: razorpay_payment_id,
      amountPaid: course.price
    });

    res.json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await CourseEnrollment.find({ studentId: req.userId })
      .populate({
        path: 'courseId',
        populate: { path: 'tutorId', select: 'name profileImage' }
      });
    const courses = enrollments.map(e => e.courseId).filter(Boolean);
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};
