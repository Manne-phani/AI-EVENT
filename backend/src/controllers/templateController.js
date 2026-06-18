const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll } = require('../config/db');

// Get all templates (presets + custom)
const getTemplates = async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM templates ORDER BY is_preset DESC, name ASC');
    const formatted = rows.map(row => ({
      id: row.id,
      name: row.name,
      eventType: row.event_type,
      guestCount: row.guest_count,
      mainCakeType: row.main_cake_type,
      preferences: row.preferences,
      dietaryRestrictions: JSON.parse(row.dietary_restrictions || '[]'),
      budgetRange: row.budget_range,
      specialInstructions: row.special_instructions,
      isPreset: !!row.is_preset
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching templates:', error.message);
    return res.status(500).json({ error: 'Server error retrieving templates.' });
  }
};

// Create a new custom template
const createTemplate = async (req, res) => {
  const {
    name,
    eventType,
    guestCount,
    mainCakeType,
    preferences,
    dietaryRestrictions,
    budgetRange,
    specialInstructions
  } = req.body;

  if (!name || !eventType || !guestCount || !mainCakeType || !budgetRange) {
    return res.status(400).json({ error: 'Template Name, Event Type, Guest Count, Main Cake Type, and Budget Range are required.' });
  }

  try {
    const id = uuidv4();
    const restrictionsStr = Array.isArray(dietaryRestrictions) 
      ? JSON.stringify(dietaryRestrictions) 
      : JSON.stringify([]);

    await dbRun(`
      INSERT INTO templates (id, name, event_type, guest_count, main_cake_type, preferences, dietary_restrictions, budget_range, special_instructions, is_preset)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      id,
      name,
      eventType,
      parseInt(guestCount, 10),
      mainCakeType,
      preferences || '',
      restrictionsStr,
      budgetRange,
      specialInstructions || ''
    ]);

    return res.status(201).json({
      message: 'Template created successfully',
      template: {
        id,
        name,
        eventType,
        guestCount,
        mainCakeType,
        preferences,
        dietaryRestrictions,
        budgetRange,
        specialInstructions,
        isPreset: false
      }
    });
  } catch (error) {
    console.error('Error creating template:', error.message);
    return res.status(500).json({ error: 'Server error creating template.' });
  }
};

module.exports = {
  getTemplates,
  createTemplate
};
