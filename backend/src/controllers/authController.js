const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet } = require('../config/db');

// Request OTP
const requestOtp = async (req, res) => {
  const { mobileNumber, gmail } = req.body;

  if (!mobileNumber || mobileNumber.trim() === '') {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  if (!gmail || gmail.trim() === '') {
    return res.status(400).json({ error: 'Gmail address is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(gmail.trim())) {
    return res.status(400).json({ error: 'Please provide a valid Gmail/email address.' });
  }

  try {
    // Clean and validate mobile format slightly
    const cleanMobile = mobileNumber.replace(/\s+/g, '');
    
    // Generate a 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins expiration

    const otpId = uuidv4();
    await dbRun(
      'INSERT INTO otps (id, mobile_number, code, expires_at, used, gmail) VALUES (?, ?, ?, ?, 0, ?)',
      [otpId, cleanMobile, code, expiresAt, gmail.trim().toLowerCase()]
    );

    // Print OTP in backend logs for the tester
    console.log(`\n========================================`);
    console.log(`[SMS MOCK] To: ${cleanMobile}`);
    console.log(`[SMS MOCK] Gmail: ${gmail.trim().toLowerCase()}`);
    console.log(`[SMS MOCK] Verification Code: ${code}`);
    console.log(`[SMS MOCK] (Alternative: '1234' also works for testing)`);
    console.log(`========================================\n`);

    return res.status(200).json({
      message: 'OTP sent successfully (mocked). Check the server console or use 1234.',
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

    // Retrieve gmail to link to user
    let userGmail = '';
    if (otpRecord) {
      userGmail = otpRecord.gmail;
    } else {
      // If bypass code was used, fetch the latest gmail entered for this number
      const latestOtp = await dbGet('SELECT gmail FROM otps WHERE mobile_number = ? ORDER BY expires_at DESC LIMIT 1', [cleanMobile]);
      userGmail = latestOtp ? latestOtp.gmail : 'guest@gmail.com';
    }

    // Find or create User
    let user = await dbGet('SELECT * FROM users WHERE mobile_number = ?', [cleanMobile]);
    if (!user) {
      const userId = uuidv4();
      await dbRun('INSERT INTO users (id, mobile_number, gmail) VALUES (?, ?, ?)', [userId, cleanMobile, userGmail]);
      user = { id: userId, mobile_number: cleanMobile, gmail: userGmail };
      console.log(`Created new user for mobile: ${cleanMobile} / ${userGmail}`);
    } else {
      // Update the user's gmail address
      await dbRun('UPDATE users SET gmail = ? WHERE id = ?', [userGmail, user.id]);
      user.gmail = userGmail;
      console.log(`Updated user gmail for mobile: ${cleanMobile} / ${userGmail}`);
    }

    // Generate JWT containing user details including gmail
    const token = jwt.sign(
      { id: user.id, mobile_number: user.mobile_number, gmail: user.gmail },
      process.env.JWT_SECRET || 'cakes_and_crunches_secret_key_12345',
      { expiresIn: '30d' } // Stay logged in for 30 days
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        gmail: user.gmail
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
