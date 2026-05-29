import User from '../models/User.model.js';

export const applyAsTutor = async (req, res, next) => {
  try {
    const { bio, expertise } = req.body;
    if (!bio || !expertise || !Array.isArray(expertise) || expertise.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bio and expertise list are required'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = 'tutor';
    user.tutorStatus = 'pending';
    user.bio = bio;
    user.expertise = expertise;
    await user.save();

    res.json({
      success: true,
      message: 'Tutor application submitted successfully. Pending administrator approval.',
      data: {
        role: user.role,
        tutorStatus: user.tutorStatus,
        bio: user.bio,
        expertise: user.expertise
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTutors = async (req, res, next) => {
  try {
    const { search, expertise } = req.query;
    const filter = { role: 'tutor', tutorStatus: 'approved' };

    if (expertise) {
      filter.expertise = { $in: expertise.split(',') };
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const tutors = await User.find(filter).select('-password -addresses -wishlist');
    res.json({ success: true, data: tutors });
  } catch (error) {
    next(error);
  }
};

export const getTutorById = async (req, res, next) => {
  try {
    const tutor = await User.findOne({
      _id: req.params.id,
      role: 'tutor',
      tutorStatus: 'approved'
    }).select('-password -addresses -wishlist');

    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found or not approved' });
    }

    res.json({ success: true, data: tutor });
  } catch (error) {
    next(error);
  }
};
