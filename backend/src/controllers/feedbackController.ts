import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { UserRequest } from '../middlewares/authMiddleware';

export const submitFeedback = async (req: UserRequest, res: Response) => {
  try {
    const { type, content, rating } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      type: type || 'General',
      content,
      rating
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
};

export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name phone').sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({ message: 'Server error while fetching feedbacks' });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();

    res.status(200).json({ message: 'Feedback status updated', feedback });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ message: 'Server error while updating feedback status' });
  }
};
