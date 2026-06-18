const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet } = require('../config/db');

// Request OTP
const requestOtp = async (req, res) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber || mobileNumber.trim() === '') {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  try {
    // Clean and validate mobile format slightly
    const cleanMobile = mobileNumber.replace(/\s+/g, '');
    
    // Generate a 4-digit OTP
    // Default to '1234' for easier testing, but let's generate a random one and support both
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins expiration

    const otpId = uuidv4();
    await dbRun(
      'INSERT INTO otps (id, mobile_number, code, expires_at, used) VALUES (?, ?, ?, ?, 0)',
      [otpId, cleanMobile, code, expiresAt]
    );

    // Print OTP in backend logs for the tester
    console.log(`\n========================================`);
    console.log(`[SMS MOCK] To: ${cleanMobile}`);
    console.log(`[SMS MOCK] Verification Code: ${code}`);
    console.log(`[SMS MOCK] (Alternative: '1234' also works for testing)`);
    console.log(`========================================\n`);

    return res.status(200).json({
      message: 'OTP sent successfully (mocked). Check the server console or use 1234.',
      // In development environment, send the code in the response to make life even easier for testing
      debugOtp: code
    });
  } catch (error) {
    console.error('Error requesting OTP:', error.message);
    return res.status(500).json({ error: 'Server error generating OTP.' });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { mobileNumber, code } = req.body;

  if (!mobileNumber || !code) {
    return res.status(400).json({ error: 'Mobile number and verification code are required.' });
  }

  try {
    const cleanMobile = mobileNumber.replace(/\s+/g, '');
    const now = new Date().toISOString();

    // Find latest OTP for this number
    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE mobile_number = ? AND used = 0 AND expires_at > ? ORDER BY expires_at DESC LIMIT 1',
      [cleanMobile, now]
    );

    // Allow testing with '1234' or matching the generated code
    const isTestingCode = code === '1234';
    const isValidCode = otpRecord && otpRecord.code === code;

    if (!isValidCode && !isTestingCode) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    // Mark OTP as used if it was valid
    if (otpRecord && isValidCode) {
      await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpRecord.id]);
    }

    // Find or create User
    let user = await dbGet('SELECT * FROM users WHERE mobile_number = ?', [cleanMobile]);
    if (!user) {
      const userId = uuidv4();
      await dbRun('INSERT INTO users (id, mobile_number) VALUES (?, ?)', [userId, cleanMobile]);
      user = { id: userId, mobile_number: cleanMobile };
      console.log(`Created new user for mobile: ${cleanMobile}`);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, mobile_number: user.mobile_number },
      process.env.JWT_SECRET || 'cakes_and_crunches_secret_key_12345',
      { expiresIn: '30d' } // Stay logged in for 30 days
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    return res.status(500).json({ error: 'Server error during OTP verification.' });
  }
};

module.exports = {
  requestOtp,
  verifyOtp
};
