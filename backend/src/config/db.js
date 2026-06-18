const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

// Ensure database file directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error enabling foreign keys:', pragmaErr.message);
      }
    });
  }
});

// Helper functions for async/await
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize Tables
const initDb = async () => {
  try {
    // 1. Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        mobile_number TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. OTPs Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS otps (
        id TEXT PRIMARY KEY,
        mobile_number TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0
      )
    `);

    // 3. Generations Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS generations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        main_cake_type TEXT NOT NULL,
        preferences TEXT,
        dietary_restrictions TEXT, -- JSON string array
        budget_range TEXT NOT NULL,
        special_instructions TEXT,
        ai_response TEXT NOT NULL, -- JSON string representing suggestions
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Feedbacks Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id TEXT PRIMARY KEY,
        generation_id TEXT UNIQUE NOT NULL,
        rating INTEGER NOT NULL,
        sentiment TEXT NOT NULL, -- 'like' or 'dislike'
        comment TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE CASCADE
      )
    `);

    // 5. Templates Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        main_cake_type TEXT NOT NULL,
        preferences TEXT,
        dietary_restrictions TEXT, -- JSON string array
        budget_range TEXT NOT NULL,
        special_instructions TEXT,
        is_preset INTEGER DEFAULT 0
      )
    `);

    // Insert presets if templates table is empty
    const presetsCount = await dbGet('SELECT COUNT(*) as count FROM templates WHERE is_preset = 1');
    if (presetsCount.count === 0) {
      const presets = [
        {
          id: uuidv4(),
          name: "Birthday Party (50 Guests)",
          event_type: "Birthday",
          guest_count: 50,
          main_cake_type: "Chocolate",
          preferences: "Rich chocolate flavor, kids-friendly, bite-sized snacks.",
          dietary_restrictions: JSON.stringify(["Eggless"]),
          budget_range: "Premium",
          special_instructions: "Include a mix of chocolate cupcakes and cake pops.",
          is_preset: 1
        },
        {
          id: uuidv4(),
          name: "Grand Wedding (200 Guests)",
          event_type: "Wedding",
          guest_count: 200,
          main_cake_type: "Red Velvet",
          preferences: "Elegant, sophisticated presentation, floral themes.",
          dietary_restrictions: JSON.stringify(["Gluten-Free", "Eggless"]),
          budget_range: "Luxury",
          special_instructions: "Macarons and gourmet tartlets to match the theme.",
          is_preset: 1
        },
        {
          id: uuidv4(),
          name: "Corporate Event (100 Guests)",
          event_type: "Corporate Event",
          guest_count: 100,
          main_cake_type: "Vanilla",
          preferences: "Clean look, easy to eat while networking, light desserts.",
          dietary_restrictions: JSON.stringify(["Sugar-Free", "Vegan"]),
          budget_range: "Budget-friendly",
          special_instructions: "Fruit skewers, vegan brownies, and sugar-free lemon tarts.",
          is_preset: 1
        },
        {
          id: uuidv4(),
          name: "Festival Celebration (120 Guests)",
          event_type: "Festival",
          guest_count: 120,
          main_cake_type: "Butterscotch",
          preferences: "Traditional twist, rich flavors, colorful setup.",
          dietary_restrictions: JSON.stringify(["Eggless"]),
          budget_range: "Premium",
          special_instructions: "Fusion desserts like butterscotch cardamom tarts and dry fruit cookies.",
          is_preset: 1
        },
        {
          id: uuidv4(),
          name: "Kids Party (30 Guests)",
          event_type: "Birthday",
          guest_count: 30,
          main_cake_type: "Vanilla",
          preferences: "Bright colors, fun designs, very sweet and playful.",
          dietary_restrictions: JSON.stringify([]),
          budget_range: "Budget-friendly",
          special_instructions: "Mini vanilla donuts, colorful sprinkles, marshmallow pops.",
          is_preset: 1
        }
      ];

      for (const p of presets) {
        await dbRun(`
          INSERT INTO templates (id, name, event_type, guest_count, main_cake_type, preferences, dietary_restrictions, budget_range, special_instructions, is_preset)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [p.id, p.name, p.event_type, p.guest_count, p.main_cake_type, p.preferences, p.dietary_restrictions, p.budget_range, p.special_instructions, p.is_preset]);
      }
      console.log('Database presets seeded.');
    }
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDb
};
