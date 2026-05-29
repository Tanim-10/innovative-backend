import Workshop from '../models/Workshop.model.js';
import User from '../models/User.model.js';

export const createWorkshopAdmin = async (req, res, next) => {
  try {
    const { title, description, date, time, duration, meetingLink, hostName, hostLinkedIn, thumbnail } = req.body;

    if (!title || !description || !date || !time || !duration || !meetingLink || !hostName) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, description, date, time, duration, meetingLink, hostName) are required'
      });
    }

    const workshop = await Workshop.create({
      title,
      description,
      hostName,
      hostLinkedIn,
      thumbnail,
      date: new Date(date),
      time,
      duration,
      meetingLink,
      status: 'approved' // directly approved since it is created by admin
    });

    res.status(201).json({
      success: true,
      message: 'Workshop created successfully by administrator.',
      data: workshop
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovedWorkshops = async (req, res, next) => {
  try {
    // Return approved workshops scheduled for today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workshops = await Workshop.find({
      status: 'approved',
      date: { $gte: today }
    })
    .populate('hostId', 'name profileImage bio')
    .sort({ date: 1, time: 1 });

    res.json({ success: true, data: workshops });
  } catch (error) {
    next(error);
  }
};

export const enrollInWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    if (workshop.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot enroll in an unapproved workshop' });
    }

    if (workshop.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this workshop' });
    }

    workshop.enrolledStudents.push(req.userId);
    await workshop.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in the workshop',
      data: workshop
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledWorkshops = async (req, res, next) => {
  try {
    const workshops = await Workshop.find({
      enrolledStudents: req.userId
    })
    .populate('hostId', 'name profileImage')
    .sort({ date: 1, time: 1 });

    res.json({ success: true, data: workshops });
  } catch (error) {
    next(error);
  }
};

export const getMyHostedWorkshops = async (req, res, next) => {
  try {
    const workshops = await Workshop.find({
      hostId: req.userId
    }).sort({ date: -1 });

    res.json({ success: true, data: workshops });
  } catch (error) {
    next(error);
  }
};
