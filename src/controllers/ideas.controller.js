import Idea from '../models/Idea.model.js';
import IdeaComment from '../models/IdeaComment.model.js';
import { uploadToCloudinary } from '../middleware/upload.middleware.js';

// Create a new idea (community or structured)
export const createIdea = async (req, res, next) => {
  try {
    const {
      type,
      title,
      category,
      description,
      problemStatement,
      solution,
      techStack,
      links
    } = req.body;

    if (!type || !description) {
      return res.status(400).json({ success: false, message: 'Type and description are required' });
    }

    if (type === 'structured' && !title) {
      return res.status(400).json({ success: false, message: 'Title is required for structured ideas' });
    }

    // Parse arrays passed as strings/JSON
    let parsedTechStack = [];
    if (techStack) {
      try {
        parsedTechStack = Array.isArray(techStack) ? techStack : JSON.parse(techStack);
      } catch (e) {
        parsedTechStack = String(techStack).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    let parsedLinks = [];
    if (links) {
      try {
        parsedLinks = Array.isArray(links) ? links : JSON.parse(links);
      } catch (e) {
        parsedLinks = String(links).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Author details
    const ideaData = {
      type,
      title: title || '',
      category: category || 'Other',
      description,
      problemStatement: problemStatement || '',
      solution: solution || '',
      techStack: parsedTechStack,
      links: parsedLinks,
      photos: [],
      files: [],
      upvotes: [],
      downvotes: []
    };

    if (req.isAdmin) {
      ideaData.adminId = req.admin.id;
    } else {
      ideaData.userId = req.user._id;
    }

    // Handle files upload
    if (req.files) {
      // Photos (images)
      if (req.files.photos) {
        for (const file of req.files.photos) {
          const result = await uploadToCloudinary(file.buffer, 'innovative-hub/ideas/photos');
          ideaData.photos.push(result.secure_url);
        }
      }
      // Documents (PDF / PPT)
      if (req.files.files) {
        for (const file of req.files.files) {
          const resourceType = file.mimetype === 'application/pdf' ? 'auto' : 'raw';
          const result = await uploadToCloudinary(file.buffer, 'innovative-hub/ideas/files', resourceType);
          ideaData.files.push({
            name: file.originalname,
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    }

    const idea = await Idea.create(ideaData);
    
    // Populate author before returning
    const populatedIdea = await Idea.findById(idea._id)
      .populate('userId', 'name profileImage bio role')
      .populate('adminId', 'email role');

    res.status(201).json({ success: true, data: populatedIdea, message: 'Idea created successfully' });
  } catch (err) {
    next(err);
  }
};

// Get ideas list
export const getIdeas = async (req, res, next) => {
  try {
    const { type, category, search, userId, skip = 0, limit = 10, sort = 'latest' } = req.query;

    const query = { isDeleted: false };

    // Standard users cannot view hidden ideas
    if (!req.isAdmin) {
      query.isHidden = false;
    }

    if (type) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { problemStatement: searchRegex },
        { solution: searchRegex },
        { techStack: { $in: [searchRegex] } }
      ];
    }

    const parsedLimit = parseInt(String(limit), 10);
    const parsedSkip = parseInt(String(skip), 10);

    let ideas;
    let total;

    if (sort === 'upvotes') {
      // Use aggregation pipeline to sort by upvotes array length
      const countPipeline = [
        { $match: query },
        { $count: 'count' }
      ];
      const countResult = await Idea.aggregate(countPipeline);
      total = countResult[0]?.count || 0;

      const pipeline = [
        { $match: query },
        { $addFields: { upvotesCount: { $size: '$upvotes' } } },
        { $sort: { upvotesCount: -1, createdAt: -1 } },
        { $skip: parsedSkip },
        { $limit: parsedLimit }
      ];

      const rawIdeas = await Idea.aggregate(pipeline);
      
      // Populate aggregation results
      ideas = await Idea.populate(rawIdeas, [
        { path: 'userId', select: 'name profileImage bio role' },
        { path: 'adminId', select: 'email role' }
      ]);
    } else {
      total = await Idea.countDocuments(query);
      ideas = await Idea.find(query)
        .populate('userId', 'name profileImage bio role')
        .populate('adminId', 'email role')
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit);
    }

    res.json({
      success: true,
      data: ideas,
      total,
      message: 'Ideas fetched successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get single idea details
export const getIdeaById = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, isDeleted: false })
      .populate('userId', 'name profileImage bio role expertise education socials')
      .populate('adminId', 'email role');

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    if (idea.isHidden && !req.isAdmin) {
      return res.status(403).json({ success: false, message: 'This post has been hidden by moderator' });
    }

    res.json({ success: true, data: idea });
  } catch (err) {
    next(err);
  }
};

// Update an idea
export const updateIdea = async (req, res, next) => {
  try {
    const { title, category, description, problemStatement, solution, techStack, links } = req.body;
    const idea = await Idea.findById(req.params.id);

    if (!idea || idea.isDeleted) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    // Verify authorship
    const isOwner = req.isAdmin
      ? (idea.adminId && String(idea.adminId) === String(req.admin.id))
      : (idea.userId && String(idea.userId) === String(req.user._id));

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this idea' });
    }

    if (description != null) idea.description = description;
    if (title != null) idea.title = title;
    if (category != null) idea.category = category;
    if (problemStatement != null) idea.problemStatement = problemStatement;
    if (solution != null) idea.solution = solution;

    if (techStack) {
      try {
        idea.techStack = Array.isArray(techStack) ? techStack : JSON.parse(techStack);
      } catch (e) {
        idea.techStack = String(techStack).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (links) {
      try {
        idea.links = Array.isArray(links) ? links : JSON.parse(links);
      } catch (e) {
        idea.links = String(links).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    await idea.save();
    
    const populated = await Idea.findById(idea._id)
      .populate('userId', 'name profileImage bio role')
      .populate('adminId', 'email role');

    res.json({ success: true, data: populated, message: 'Idea updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete an idea
export const deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea || idea.isDeleted) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    const isOwner = req.isAdmin
      ? (idea.adminId && String(idea.adminId) === String(req.admin.id))
      : (idea.userId && String(idea.userId) === String(req.user._id));

    // Admin can delete any post
    if (!isOwner && !req.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this idea' });
    }

    idea.isDeleted = true;
    await idea.save();

    res.json({ success: true, message: 'Idea deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Toggle Vote (Upvote / Downvote)
export const toggleVote = async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const idea = await Idea.findById(req.params.id);

    if (!idea || idea.isDeleted) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    const voterId = req.isAdmin ? String(req.admin.id) : String(req.user._id);

    if (voteType === 'up') {
      const upIndex = idea.upvotes.indexOf(voterId);
      const downIndex = idea.downvotes.indexOf(voterId);

      if (upIndex > -1) {
        // Toggle off
        idea.upvotes.splice(upIndex, 1);
      } else {
        // Add upvote
        idea.upvotes.push(voterId);
        // Remove downvote if present
        if (downIndex > -1) {
          idea.downvotes.splice(downIndex, 1);
        }
      }
    } else if (voteType === 'down') {
      const upIndex = idea.upvotes.indexOf(voterId);
      const downIndex = idea.downvotes.indexOf(voterId);

      if (downIndex > -1) {
        // Toggle off
        idea.downvotes.splice(downIndex, 1);
      } else {
        // Add downvote
        idea.downvotes.push(voterId);
        // Remove upvote if present
        if (upIndex > -1) {
          idea.upvotes.splice(upIndex, 1);
        }
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid voteType. Must be 'up' or 'down'" });
    }

    await idea.save();

    res.json({
      success: true,
      data: {
        upvotes: idea.upvotes,
        downvotes: idea.downvotes,
        upvotesCount: idea.upvotes.length,
        downvotesCount: idea.downvotes.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// Comment management

// Add comment
export const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const ideaId = req.params.id;

    if (!comment || String(comment).trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea || idea.isDeleted) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    const commentData = {
      ideaId,
      comment: String(comment).trim()
    };

    if (req.isAdmin) {
      commentData.adminId = req.admin.id;
    } else {
      commentData.userId = req.user._id;
    }

    const newComment = await IdeaComment.create(commentData);

    // Increment commentsCount on Idea
    idea.commentsCount = (idea.commentsCount || 0) + 1;
    await idea.save();

    const populated = await IdeaComment.findById(newComment._id)
      .populate('userId', 'name profileImage bio role')
      .populate('adminId', 'email role');

    res.status(201).json({ success: true, data: populated, message: 'Comment added successfully' });
  } catch (err) {
    next(err);
  }
};

// Fetch comments
export const getComments = async (req, res, next) => {
  try {
    const query = { ideaId: req.params.id, isDeleted: false };
    
    if (!req.isAdmin) {
      query.isHidden = false;
    }

    const comments = await IdeaComment.find(query)
      .populate('userId', 'name profileImage bio role')
      .populate('adminId', 'email role')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await IdeaComment.findById(req.params.commentId);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isOwner = req.isAdmin
      ? (comment.adminId && String(comment.adminId) === String(req.admin.id))
      : (comment.userId && String(comment.userId) === String(req.user._id));

    if (!isOwner && !req.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Hard delete is clean for comments, or soft delete. Let's do soft delete first
    comment.isDeleted = true;
    await comment.save();

    // Decrement commentsCount on Idea
    await Idea.findByIdAndUpdate(comment.ideaId, { $inc: { commentsCount: -1 } });

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Toggle Hide Idea (Admin only)
export const toggleHideIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea || idea.isDeleted) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    idea.isHidden = !idea.isHidden;
    await idea.save();

    res.json({
      success: true,
      data: { isHidden: idea.isHidden },
      message: `Idea is now ${idea.isHidden ? 'hidden' : 'visible'}`
    });
  } catch (err) {
    next(err);
  }
};

// Toggle Hide Comment (Admin only)
export const toggleHideComment = async (req, res, next) => {
  try {
    const comment = await IdeaComment.findById(req.params.commentId);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.isHidden = !comment.isHidden;
    await comment.save();

    res.json({
      success: true,
      data: { isHidden: comment.isHidden },
      message: `Comment is now ${comment.isHidden ? 'hidden' : 'visible'}`
    });
  } catch (err) {
    next(err);
  }
};
