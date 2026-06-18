const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../config/db');
const { generatePairing } = require('../services/geminiService');

// Generate pairing suggestions
const generatePairingSuggestions = async (req, res) => {
  const userId = req.user.id;
  const {
    eventType,
    guestCount,
    mainCakeType,
    preferences,
    dietaryRestrictions, // Array of strings expected
    budgetRange,
    specialInstructions
  } = req.body;

  // Validate required inputs
  if (!eventType || !guestCount || !mainCakeType || !budgetRange) {
    return res.status(400).json({ error: 'Event Type, Guest Count, Main Cake Type, and Budget Range are required.' });
  }

  const parsedGuestCount = parseInt(guestCount, 10);
  if (isNaN(parsedGuestCount) || parsedGuestCount <= 0) {
    return res.status(400).json({ error: 'Guest Count must be a positive number.' });
  }

  // Set timeout promise (30 seconds)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('AI generation timed out. Please try again.'));
    }, 28000); // 28 seconds timeout to be safe within the 30-second constraint
  });

  try {
    const restrictionsStr = Array.isArray(dietaryRestrictions) 
      ? JSON.stringify(dietaryRestrictions) 
      : JSON.stringify([]);

    // Call the service with timeout protection
    const aiResponse = await Promise.race([
      generatePairing({
        eventType,
        guestCount: parsedGuestCount,
        mainCakeType,
        preferences,
        dietaryRestrictions: restrictionsStr,
        budgetRange,
        specialInstructions
      }),
      timeoutPromise
    ]);

    if (!aiResponse || Object.keys(aiResponse).length === 0) {
      return res.status(500).json({ error: 'Empty response received from AI service. Please retry.' });
    }

    // Save to database
    const generationId = uuidv4();
    const responseStr = JSON.stringify(aiResponse);

    await dbRun(`
      INSERT INTO generations (id, user_id, event_type, guest_count, main_cake_type, preferences, dietary_restrictions, budget_range, special_instructions, ai_response)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      generationId,
      userId,
      eventType,
      parsedGuestCount,
      mainCakeType,
      preferences || '',
      restrictionsStr,
      budgetRange,
      specialInstructions || '',
      responseStr
    ]);

    // Return the response along with the generated record ID for feedback attachment
    return res.status(200).json({
      generationId,
      ...aiResponse
    });

  } catch (error) {
    console.error('Error in AI Menu Pairing Generation:', error.message);
    if (error.message.includes('timed out')) {
      return res.status(408).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate pairings. ' + error.message });
  }
};

// Retrieve generation history for the logged-in user
const getHistory = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;

  try {
    let sql = 'SELECT id, timestamp, event_type, guest_count, main_cake_type, budget_range, ai_response FROM generations WHERE user_id = ?';
    const params = [userId];

    if (search && search.trim() !== '') {
      sql += ' AND (event_type LIKE ? OR main_cake_type LIKE ? OR ai_response LIKE ?)';
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ' ORDER BY timestamp DESC';

    const rows = await dbAll(sql, params);

    // Format rows to include an output preview (e.g. event summary)
    const formatted = rows.map(row => {
      let preview = '';
      try {
        const parsed = JSON.parse(row.ai_response);
        preview = parsed.eventSummary || '';
      } catch (e) {
        preview = 'Menu Pairing Suggestion';
      }

      return {
        id: row.id,
        timestamp: row.timestamp,
        eventType: row.event_type,
        guestCount: row.guest_count,
        mainCakeType: row.main_cake_type,
        budgetRange: row.budget_range,
        preview
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    return res.status(500).json({ error: 'Server error retrieving history.' });
  }
};

// Get details of a single generation history item
const getHistoryById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const row = await dbGet('SELECT * FROM generations WHERE id = ? AND user_id = ?', [id, userId]);
    if (!row) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    // Check if feedback exists for this generation
    const feedback = await dbGet('SELECT rating, sentiment, comment FROM feedbacks WHERE generation_id = ?', [id]);

    let aiParsedResponse;
    try {
      aiParsedResponse = JSON.parse(row.ai_response);
    } catch (e) {
      aiParsedResponse = {};
    }

    return res.status(200).json({
      generationId: row.id,
      timestamp: row.timestamp,
      inputs: {
        eventType: row.event_type,
        guestCount: row.guest_count,
        mainCakeType: row.main_cake_type,
        preferences: row.preferences,
        dietaryRestrictions: JSON.parse(row.dietary_restrictions || '[]'),
        budgetRange: row.budget_range,
        specialInstructions: row.special_instructions
      },
      pairing: aiParsedResponse,
      feedback: feedback || null
    });
  } catch (error) {
    console.error('Error fetching details:', error.message);
    return res.status(500).json({ error: 'Server error retrieving details.' });
  }
};

// Delete a history item
const deleteHistoryItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const record = await dbGet('SELECT id FROM generations WHERE id = ? AND user_id = ?', [id, userId]);
    if (!record) {
      return res.status(404).json({ error: 'Record not found or access denied.' });
    }

    // Delete feedback will happen automatically via CASCADE
    await dbRun('DELETE FROM generations WHERE id = ?', [id]);
    return res.status(200).json({ message: 'History item successfully deleted.' });
  } catch (error) {
    console.error('Error deleting history item:', error.message);
    return res.status(500).json({ error: 'Server error deleting history item.' });
  }
};

module.exports = {
  generatePairingSuggestions,
  getHistory,
  getHistoryById,
  deleteHistoryItem
};
