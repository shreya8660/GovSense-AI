import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import { analyzeFeedback } from '../services/AI/aiService.js';
import Feedback from '../models/Feedback.js';

// @desc    Run (or re-run) AI sentiment analysis on a piece of text or an
//          existing feedback record. feedbackController.createFeedback calls
//          the aiService directly for the normal submission flow; this
//          endpoint exists for manual re-analysis and n8n/testing use.
// @route   POST /api/ai/analyze
// @access  Private (Officer/Admin) - or pass { feedbackId } to re-analyze
export const analyzeText = asyncHandler(async (req, res) => {
  const { title, description, feedbackId } = req.body;

  if (feedbackId) {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) throw new ApiError(404, 'Feedback not found');

    const analysis = await analyzeFeedback({
      title: feedback.title,
      description: feedback.description,
    });

    feedback.ai = { ...analysis, processedAt: new Date() };
    await feedback.save();

    return sendSuccess(res, 200, 'Feedback re-analyzed', { feedback });
  }

  if (!title || !description) {
    throw new ApiError(400, 'Provide either feedbackId or both title and description');
  }

  const analysis = await analyzeFeedback({ title, description });
  sendSuccess(res, 200, 'Analysis complete', { analysis });
});
