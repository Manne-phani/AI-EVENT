const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet } = require('../config/db');

// Submit feedback for a generation
const submitFeedback = async (req, res) => {
  const { generationId, rating, sentiment, comment } = req.body;

  if (!generationId || rating === undefined || !sentiment) {
    return res.status(400).json({ error: 'Generation ID, Rating (1-5), and Sentiment (like/dislike) are required.' });
  }

  const numericRating = parseInt(rating, 10);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  if (sentiment !== 'like' && sentiment !== 'dislike') {
    return res.status(400).json({ error: 'Sentiment must be either "like" or "dislike".' });
  }

  try {
    // Check if generation exists
    const generation = await dbGet('SELECT id FROM generations WHERE id = ?', [generationId]);
    if (!generation) {
      return res.status(404).json({ error: 'Generation record not found.' });
    }

    // Check if feedback already exists for this generation (upsert behavior)
    const existingFeedback = await dbGet('SELECT id FROM feedbacks WHERE generation_id = ?', [generationId]);

    if (existingFeedback) {
      await dbRun(`
        UPDATE feedbacks 
        SET rating = ?, sentiment = ?, comment = ?, timestamp = CURRENT_TIMESTAMP
        WHERE generation_id = ?
      `, [numericRating, sentiment, comment || '', generationId]);
      
      return res.status(200).json({ message: 'Feedback updated successfully.' });
    } else {
      const feedbackId = uuidv4();
      await dbRun(`
        INSERT INTO feedbacks (id, generation_id, rating, sentiment, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [feedbackId, generationId, numericRating, sentiment, comment || '']);
      
      return res.status(201).json({ message: 'Feedback submitted successfully.' });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    return res.status(500).json({ error: 'Server error saving feedback.' });
  }
};

module.exports = {
  submitFeedback
};
