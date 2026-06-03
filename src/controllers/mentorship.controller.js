import MentorshipRequest from '../models/MentorshipRequest.model.js';
import User from '../models/User.model.js';

// STUDENT: Request a live mentorship session
export const createRequest = async (req, res, next) => {
  try {
    const { topic, description, preferredDate, preferredTime } = req.body;

    if (!topic || !description || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Topic, description, preferred date, and preferred time are required'
      });
    }

    const request = await MentorshipRequest.create({
      userId: req.userId,
      topic,
      description,
      preferredDate: new Date(preferredDate),
      preferredTime,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Mentorship request submitted successfully. Pending review by an administrator.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// STUDENT: Get my mentorship requests
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await MentorshipRequest.find({ userId: req.userId })
      .populate('tutorId', 'name profileImage bio expertise')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Get all mentorship requests
export const getAllRequests = async (req, res, next) => {
  try {
    const requests = await MentorshipRequest.find({})
      .populate('userId', 'name email mobile')
      .populate('tutorId', 'name email profileImage expertise')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Update mentorship request (approve, reject, assign tutor, add link/notes)
export const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tutorId, meetingLink, adminNotes } = req.body;

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }

    // Update fields if provided
    if (status) {
      if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      request.status = status;
    }

    if (tutorId !== undefined) {
      if (tutorId === null || tutorId === '') {
        request.tutorId = undefined;
      } else {
        // Verify tutor exists and is approved
        const tutor = await User.findOne({ _id: tutorId, role: 'tutor', tutorStatus: 'approved' });
        if (!tutor) {
          return res.status(400).json({
            success: false,
            message: 'Assigned tutor must be an approved tutor user'
          });
        }
        request.tutorId = tutorId;
      }
    }

    if (meetingLink !== undefined) {
      request.meetingLink = meetingLink;
    }

    if (adminNotes !== undefined) {
      request.adminNotes = adminNotes;
    }

    await request.save();

    const updatedRequest = await MentorshipRequest.findById(id)
      .populate('userId', 'name email mobile')
      .populate('tutorId', 'name email profileImage expertise');

    res.status(200).json({
      success: true,
      message: 'Mentorship request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};
