import Internship from '../models/Internship.model.js';

export const applyForInternship = async (req, res, next) => {
  try {
    const { name, email, mobile, skills, resumeUrl, coverLetter, portfolioUrl } = req.body;

    if (!name || !email || !mobile || !resumeUrl || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, mobile, resumeUrl, and coverLetter are required'
      });
    }

    const application = await Internship.create({
      studentId: req.userId,
      name,
      email: email.toLowerCase(),
      mobile,
      skills: Array.isArray(skills) ? skills : [],
      resumeUrl,
      coverLetter,
      portfolioUrl,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Internship application submitted successfully.',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Internship.find({
      studentId: req.userId
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};
